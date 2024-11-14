'use client';

import axios from 'axios';
import { AiFillGithub } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { useCallback, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import Modal from './Modal';
import Heading from '../Heading';
import Input from '../inputs/Input';
import toast from 'react-hot-toast';
import Button from '../Button';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const RegisterModal = () => {
    const router = useRouter();
    const loginModal = useLoginModal();
    const registerModal = useRegisterModal();
    const [isLoading, setIsLoading] = useState(false);
    const [isConfettiActive, setIsConfettiActive] = useState(false);
    const { width, height } = useWindowSize();

    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
        }
    });

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setIsLoading(true);

        try {
            // Make the API call to register the user
            await axios.post('/api/register', data);
            toast.success('Registered successfully');
            setIsConfettiActive(true); // Activate confetti on successful registration

            // Automatically log the user in after registration
            const loginResponse = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (loginResponse?.ok) {
                router.refresh();
                registerModal.onClose();
            } else {
                toast.error('Auto-login failed. Please log in manually.');
            }

            // Deactivate confetti after 5 seconds
            setTimeout(() => setIsConfettiActive(false), 5000);
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const bodyContent = (
        <div className="flex flex-col gap-4">
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
                id="cardNumber"
                label="Card Number"
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
        <div className='flex flex-col gap-4 mt-4'>
            <hr />
            <Button 
                outline
                label="Continue with Google"
                icon={FcGoogle}
                onClick={() => signIn('google')}
            />
            {/* <Button 
                outline
                label="Continue with GitHub"
                icon={AiFillGithub}
                onClick={() => {}}
            /> */}
            <div className="text-neutral-500 text-center mt-4 font-light">
                <div className="justify-center text-center flex flex-row items-center gap-2">
                    <div>
                        Already have an account?
                    </div>
                    <div
                        onClick={() => {
                            registerModal.onClose();
                            loginModal.onOpen();
                        }}
                        className="text-neutral-800 cursor-pointer hover:underline"
                    >
                        Log In
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {isConfettiActive && <Confetti width={width} height={height} />}
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
        </>
    );
};

export default RegisterModal;
