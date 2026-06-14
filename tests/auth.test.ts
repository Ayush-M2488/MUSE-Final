import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken, JwtPayload } from '../backend/middleware/auth';
import { requireRole } from '../backend/middleware/rbac';

describe('Authentication Middleware (auth.ts)', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            headers: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn() as any
        };
        nextFunction = jest.fn();
        process.env.JWT_SECRET = 'test-secret-key';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if no authorization header is provided', () => {
        verifyToken(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: No token provided' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', () => {
        mockRequest.headers = { authorization: 'Basic some-token' };

        verifyToken(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: No token provided' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid or expired', () => {
        mockRequest.headers = { authorization: 'Bearer invalid-token' };

        verifyToken(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid or expired token' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() and attach user to request if token is valid', () => {
        const payload: JwtPayload = { id: 'user-1', email: 'test@example.com', role: 'student', roleId: 'USN001' };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string);

        mockRequest.headers = { authorization: `Bearer ${token}` };

        verifyToken(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockRequest.user).toBeDefined();
        expect(mockRequest.user?.email).toBe('test@example.com');
        expect(mockRequest.user?.role).toBe('student');
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should throw an error internally if JWT_SECRET is missing', () => {
        delete process.env.JWT_SECRET;
        mockRequest.headers = { authorization: 'Bearer some-token' };

        verifyToken(mockRequest as Request, mockResponse as Response, nextFunction);

        // It should catch the error and return 401
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid or expired token' });
        expect(nextFunction).not.toHaveBeenCalled();
    });
});

describe('RBAC Middleware (rbac.ts)', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            path: '/api/admin/users',
            method: 'GET',
            user: undefined
        };
        mockResponse = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn() as any
        };
        nextFunction = jest.fn();
    });

    it('should return 403 if user is not attached to request', () => {
        const middleware = requireRole(['admin']);
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden: User role not found' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not in allowed roles', () => {
        mockRequest.user = { id: '1', email: 'test@test.com', role: 'student', roleId: 'USN123' };
        
        const middleware = requireRole(['admin', 'teacher']);
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden: Requires one of [admin, teacher]' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() if user role is allowed', () => {
        mockRequest.user = { id: '1', email: 'test@test.com', role: 'admin', roleId: null };
        
        const middleware = requireRole(['admin', 'teacher']);
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
    });
});
