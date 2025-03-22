import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { createUserIdentifierService } from '@/lib/factories/serviceFactory';
import { updateUserIdentifierSchema } from '@/lib/validators/userIdentifierValidator';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate user
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json(
      { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { status: 400, message: 'Missing identifier ID', code: 'MISSING_ID' },
      { status: 400 }
    );
  }

  try {
    // Get the specific user identifier
    const userIdentifierService = createUserIdentifierService();
    const userIdentifier = await userIdentifierService.getById(id, user.id);

    if (!userIdentifier) {
      return NextResponse.json(
        { status: 404, message: 'User identifier not found', code: 'USER_IDENTIFIER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(userIdentifier);
  } catch (error) {
    console.error('Failed to fetch user identifier:', error);
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Failed to fetch user identifier', 
        code: 'USER_IDENTIFIER_FETCH_FAILED' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate user
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json(
      { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { status: 400, message: 'Missing identifier ID', code: 'MISSING_ID' },
      { status: 400 }
    );
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateUserIdentifierSchema.parse(body);

    // Update the user identifier
    const userIdentifierService = createUserIdentifierService();
    const updatedUserIdentifier = await userIdentifierService.update(id, user.id, validatedData);

    if (!updatedUserIdentifier) {
      return NextResponse.json(
        { status: 404, message: 'User identifier not found', code: 'USER_IDENTIFIER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUserIdentifier);
  } catch (error) {
    console.error('Failed to update user identifier:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          status: 400, 
          message: 'Validation error', 
          code: 'VALIDATION_ERROR',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        status: 500, 
        message: 'Failed to update user identifier', 
        code: 'USER_IDENTIFIER_UPDATE_FAILED' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate user
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json(
      { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { status: 400, message: 'Missing identifier ID', code: 'MISSING_ID' },
      { status: 400 }
    );
  }

  try {
    // Delete the user identifier
    const userIdentifierService = createUserIdentifierService();
    const deleted = await userIdentifierService.delete(id, user.id);

    if (!deleted) {
      return NextResponse.json(
        { status: 404, message: 'User identifier not found', code: 'USER_IDENTIFIER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete user identifier:', error);
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Failed to delete user identifier', 
        code: 'USER_IDENTIFIER_DELETE_FAILED' 
      },
      { status: 500 }
    );
  }
} 