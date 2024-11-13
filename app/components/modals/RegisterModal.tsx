'use client';

import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';
import {
  FieldValues,
  SubmitHandler,
  useForm
} from 'react-hook-form';

import useRegisterModal from '@/app/hooks/useRegisterModal';
import Modal from './Modal';
import Heading from '../Heading';
import Input from '../inputs/Input';
import toast from 'react-hot-toast';
import Button from '../Button';
import useLoginModal from '@/app/hooks/useLoginModal';
import { signIn } from 'next-auth/react';

const RegisterModal = () => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues:{
        name: '',
        email: '',
        password: '',
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) =>  {
    setIsLoading(true);
    
    axios.post('/api/register', data)
        .then(() => {
            registerModal.onClose();
        })
        .catch(() => {
            toast.error('Something went wrong');
        })
        .finally(() => {
            setIsLoading(false);
        });
  };

  const bodyContent = (
    <div className="flex flex-col gap-4 px-4 sm:px-6 lg:px-8 w-full max-w-md">
        <Heading 
            title="Welcome to TrueFare"
            subtitle="Create an account!"
        />
        <Input 
            id="email"
            label="Email"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
        />
        <Input 
            id="name"
            label="Name"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
        />
        <Input 
            id="phoneNumber"
            label="Phone Number"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
        />
        <Input 
            id="password"
            type="password"
            label="Password"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
        />
    </div>
  );

  const footerContent = (
    <div className='max-w-full sm:max-w-lg mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen'>
        <hr />
        <Button 
            outline
            label="Continue with Google"
            icon={FcGoogle}
            onClick={() => signIn('google')}
        />
        <div
            className="
                text-neutral-500
                text-center
                mt-4
                font-light
            "
        >
            <div className=" justify-center text-center flex flex-row items-center gap-2">
                <div>
                    Already have an account?
                </div>
                <div
                      onClick={() => {
                        registerModal.onClose();
                        loginModal.onOpen();
                        }}
                    className="
                        text-neutral-800
                        cursor-pointer
                        hover:underline
                    "
                >
                    Log In
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <Modal
        disabled={isLoading}
        isOpen={registerModal.isOpen}
        title="Register"
        actionLabel="Continue"
        onClose={registerModal.onClose}
        onSubmit={handleSubmit(onSubmit)}
        body={bodyContent}
        footer={footerContent}
    />
  );
};

export default RegisterModal;
