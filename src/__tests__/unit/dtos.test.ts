import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from '../../dtos/auth.dto';
import { CreateUserDTO, UpdateUserDTO, LoginUserDTO } from '../../dtos/user.dto';

describe('DTO Validation Tests', () => {
  
  // Group 1: Registration (auth.dto)
  describe('RegisterDto', () => {
    it('should validate a correct registration payload', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123'
      };
      const result = RegisterDto.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail if email is invalid', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        username: 'johndoe',
        password: 'password123'
      };
      const result = RegisterDto.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // Group 2: User Creation (user.dto)
  describe('CreateUserDTO', () => {
    it('should pass when password and confirmPassword match', () => {
      const validData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        username: 'janedoe',
        password: 'securepassword',
        confirmPassword: 'securepassword'
      };
      const result = CreateUserDTO.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when password and confirmPassword do not match', () => {
      const mismatchData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        username: 'janedoe',
        password: 'securepassword',
        confirmPassword: 'differentpassword'
      };
      const result = CreateUserDTO.safeParse(mismatchData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords do not match");
      }
    });
  });

  // Group 3: Login (auth.dto)
  describe('LoginDto', () => {
    it('should validate a correct login payload', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };
      const result = LoginDto.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail if password is too short', () => {
      const shortPassword = {
        email: 'test@example.com',
        password: '123'
      };
      const result = LoginDto.safeParse(shortPassword);
      expect(result.success).toBe(false);
    });
  });

  // Group 4: User Login (user.dto)
  describe('LoginUserDTO', () => {
    it('should fail if email is missing', () => {
      const missingEmail = {
        password: 'password123'
      };
      const result = LoginUserDTO.safeParse(missingEmail);
      expect(result.success).toBe(false);
    });
  });

  // Group 5: Password Recovery (auth.dto)
  describe('ForgotPasswordDto', () => {
    it('should validate a valid email', () => {
      const data = { email: 'recover@example.com' };
      expect(ForgotPasswordDto.safeParse(data).success).toBe(true);
    });
  });

  describe('ResetPasswordDto', () => {
    it('should fail if token is missing', () => {
      const data = { newPassword: 'newpassword123' };
      expect(ResetPasswordDto.safeParse(data).success).toBe(false);
    });
  });

  describe('ChangePasswordDto', () => {
    it('should fail if new password is too short', () => {
      const data = { oldPassword: 'oldpassword123', newPassword: '123' };
      expect(ChangePasswordDto.safeParse(data).success).toBe(false);
    });
  });

  // Group 6: Profile Updates (user.dto)
  describe('UpdateUserDTO', () => {
    it('should allow partial updates (e.g., only firstName)', () => {
      const partialData = {
        firstName: 'NewName'
      };
      const result = UpdateUserDTO.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should fail if a field has an invalid type', () => {
      const invalidType = {
        firstName: 123 // Should be string
      };
      const result = UpdateUserDTO.safeParse(invalidType);
      expect(result.success).toBe(false);
    });
  });
});
