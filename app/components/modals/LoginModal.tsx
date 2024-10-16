'use client';

import axios from 'axios';
import { AiFillGithub } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
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

const LoginModal = () => {
    const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues:{
        name: '',
        email: '',
        password: ''
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) =>  {
    setIsLoading(true);
    
    axios.post('/api/register', data)
        .then(() => {
            loginModal.onClose();
        })
        .catch((error) => {
            toast.error('Something went wrong');
        })
        .finally(() => {
            setIsLoading(false);
        })
  }

  const bodyContent = (
    <div className="flex flex-col gap-4">
        <Heading 
            title = "Welcome to TrueFare"
            subtitle = "Create an account!"
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
