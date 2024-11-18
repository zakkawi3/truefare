'use client';

import axios from 'axios';
import { AiFillGithub } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { signIn } from 'next-auth/react';
import { useCallback, useState } from 'react';

import {
  FieldValues,
  SubmitHandler,
  useForm
} from 'react-hook-form';

import useLoginModal from '@/app/hooks/useLoginModal';
import { error } from 'console';
import Modal from './Modal';
import Heading from '../Heading';
import Input from '../inputs/Input';
import toast from 'react-hot-toast';
import Button from '../Button';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import { callbackify } from 'util';
import { useRouter } from 'next/navigation';

const LoginModal = () => {
    const router = useRouter();
    const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues:{
        email: '',
        password: ''
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) =>  {
    setIsLoading(true);
    
    signIn('credentials', {
        ...data,
        redirect: false,
    })
    .then((callback) => {
        setIsLoading(false);
  
        if(callback?.ok){
            // toast.success('Logged in');
            // Save the email to local storage after a successful login
            localStorage.setItem('userEmail', data.email);
            router.refresh();
            loginModal.onClose();
        }
  
        if(callback?.error){
            toast.error(callback.error);
        }
    })
  }
  

  const bodyContent = (
    <div className="flex flex-col gap-4">
        <Heading 
            title = "Welcome back"
            subtitle = "Log into your account!"
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
            id="password"
            type="password"
            label="Password"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
        />
    </div>
  )

  const footerContent = (
    <div className='flex flex-col gap-4 mt-4'>
        <hr />
        <Button 
            outline
            label="Login with Google"
            icon={FcGoogle}
            onClick={() => {}}
        />
        {/* <Button 
            outline
            label="Continue with GitHub"
            icon={AiFillGithub}
            onClick={() => {}}
        /> */}
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
                    Don't have an account?
                </div>
                <div
                    onClick={() => {
                        loginModal.onClose();
                        registerModal.onOpen();
                      }}
                    className="
                        text-neutral-800
                        cursor-pointer
                        hover:underline
                    "
                >
                    Register
                </div>
            </div>
        </div>
    </div>
  )

  return (
    <Modal
        disabled={isLoading}
        isOpen={loginModal.isOpen}
        title="Login"
        actionLabel="Login"
        onClose={loginModal.onClose}
        onSubmit={handleSubmit(onSubmit)}
        body={bodyContent}
        footer={footerContent}
    />
  );
};

export default LoginModal;
