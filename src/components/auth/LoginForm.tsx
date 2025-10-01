import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../schemas/auth';
import { LoginFormData } from '../../types/auth';
import { AnimatedLogo } from '../ui/AnimatedLogo';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  return (
    <div className="backdrop-blur-2xl bg-white/10 p-10 rounded-3xl shadow-2xl border border-white/20">
      <AnimatedLogo />
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          type="email"
          label="Email"
          error={errors.email?.message}
          {...register('email')}
        />
        
        <Input
          type="password"
          label="Password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full"
        >
          Sign In
        </Button>
      </form>
    </div>
  );
};