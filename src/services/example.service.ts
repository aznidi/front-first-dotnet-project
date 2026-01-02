import { studentsService } from './students.service';
import { teachersService } from './teachers.service';
import { subjectsService } from './subjects.service';
import { authService } from './auth.service';

export const exampleUsage = {
  async loginExample() {
    try {
      const response = await authService.login({
        email: 'user@example.com',
        password: 'password123',
      });
      
      if (response.success && response.data) {
        console.log('Login successful:', response.data);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  },

  async getStudentsExample() {
    try {
      const response = await studentsService.getAll();
      
      if (response.success && response.data) {
        console.log('Students:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  },

  async createStudentExample() {
    try {
      const response = await studentsService.create({
        firstName: 'John',
        lastName: 'Doe',
        cin: 'AB123456',
        dateNaissance: '2005-01-15',
      });
      
      if (response.success && response.data) {
        console.log('Student created:', response.data);
      }
    } catch (error) {
      console.error('Failed to create student:', error);
    }
  },

  async updateTeacherExample(teacherId: number) {
    try {
      const response = await teachersService.update(teacherId, {
        nom: 'Smith',
        prenom: 'John',
        cin: 'CD789012',
        dateNaissance: '1985-03-20',
      });
      
      if (response.success && response.data) {
        console.log('Teacher updated:', response.data);
      }
    } catch (error) {
      console.error('Failed to update teacher:', error);
    }
  },

  async getSubjectsExample() {
    try {
      const response = await subjectsService.getAll();
      
      if (response.success && response.data) {
        console.log('Subjects:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  },
};
