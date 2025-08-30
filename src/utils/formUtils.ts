import { useState, useCallback } from 'react';
import { useAppDispatch } from '../redux/store';
import { fetchAllUsers, createUser, updateUser, deleteUser } from '../redux/slices/userSlice';
import apiService from '../services/api';

// Shared form interfaces
export interface BaseUserForm {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  password: string;
}

export interface StudentForm extends BaseUserForm {
  college: string;
  careerTrack: string;
}

export interface StaffForm extends BaseUserForm {
  department: string;
  college: string;
  careerTrack: string;
}

export interface AdminForm extends BaseUserForm {
  // Admin-specific fields if any
}

// Shared form state management
export const useFormState = <T extends BaseUserForm>(defaultForm: T) => {
  const [formData, setFormData] = useState<T>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdPassword, setCreatedPassword] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState<{ id: string; name: string; email: string } | null>(null);

  const resetForm = useCallback(() => {
    setFormData(defaultForm);
    setFormError('');
    setSuccessMessage(null);
  }, [defaultForm]);

  const updateFormField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
  }, [formError]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (formError) setFormError('');
  }, [formError]);

  return {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    formError,
    setFormError,
    successMessage,
    setSuccessMessage,
    showPasswordModal,
    setShowPasswordModal,
    createdPassword,
    setCreatedPassword,
    resetModalOpen,
    setResetModalOpen,
    resetUser,
    setResetUser,
    resetForm,
    updateFormField,
    handleInputChange
  };
};

// Shared user management functions
export const useUserManagement = () => {
  const dispatch = useAppDispatch();

  const handleCreateUser = useCallback(async (userData: any, role: string) => {
    try {
      const response = await dispatch(createUser({ ...userData, role })).unwrap();
      if (response.success) {
        return { success: true, password: response.password };
      }
      return { success: false, message: response.message || 'Failed to create user' };
    } catch (error: any) {
      return { success: false, message: error.message || 'An error occurred' };
    }
  }, [dispatch]);

  const handleUpdateUser = useCallback(async (userId: string, userData: any) => {
    try {
      const response = await dispatch(updateUser({ id: userId, ...userData })).unwrap();
      return { success: response.success, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'An error occurred' };
    }
  }, [dispatch]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      const response = await dispatch(deleteUser(userId)).unwrap();
      return { success: response.success, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'An error occurred' };
    }
  }, [dispatch]);

  const handleResetPassword = useCallback(async (userId: string) => {
    try {
      const newPassword = generatePassword();
      const response = await apiService.resetUserPassword(userId, newPassword);
      if (response.success) {
        return { success: true, password: newPassword };
      }
      return { success: false, message: response.message || 'Failed to reset password' };
    } catch (error: any) {
      return { success: false, message: error.message || 'An error occurred' };
    }
  }, []);

  return {
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleResetPassword
  };
};

// Shared password generation
export const generatePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let pwd = '';
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

// Shared form validation
export const validateUserForm = (formData: BaseUserForm): string | null => {
  if (!formData.name.trim()) return 'Name is required';
  if (!formData.email.trim()) return 'Email is required';
  if (!formData.email.includes('@')) return 'Please enter a valid email';
  if (!formData.password.trim()) return 'Password is required';
  if (formData.password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

// Shared search and filter logic
export const useSearchAndFilter = <T>(items: T[], searchFields: (keyof T)[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  const updateSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(term.toLowerCase());
      })
    );
    setFilteredItems(filtered);
  }, [items, searchFields]);

  return {
    searchTerm,
    filteredItems,
    updateSearch
  };
};
