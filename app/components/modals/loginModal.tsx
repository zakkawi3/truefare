// 'use client';

// import { FcGoogle } from "react-icons/fc";
// import { use, useCallback, useState } from "react";
// import {
//   FieldValues,
//   SubmitHandler,
//   useForm
// } from 'react-hook-form';

// import useLoginModal from "@/app/hooks/useLoginModal";
// import Modal from "./modal";
// import Heading from "../heading";
// import TextInput from "../inputs/textInput";
// import toast from "react-hot-toast";
// import Button from "../button";
// import useRegisterModal from "@/app/hooks/useRegisterModal";
// import { useRouter } from "next/navigation";

// const LoginModal = () => {
//   const router = useRouter()
//   const registerModal = useRegisterModal();
//   const loginModal = useLoginModal();
//   const [isLoading, setIsLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: {
//       errors,
//     }
//   } = useForm<FieldValues>({
//     defaultValues: {
//       email: '',
//       password: ''
//   }
//   });

//   const onSubmit: SubmitHandler<FieldValues> = (data) => {
//     toast.success('Logged in successfully!');
//     console.log('data:', data);
//     reset();
//     router.refresh();
//     loginModal.onClose();
//   }

//   const toggle = useCallback(() => {
//     loginModal.onClose();
//     registerModal.onOpen();
//   }, [loginModal, registerModal]);

//   const handleGoogleSignIn = async () => {
//     toast.success('Logged in with Google');
//     reset();
//     loginModal.onClose();
//   };

//   const bodyContent = (
//     <div className="flex flex-col gap-4">
//       <Heading
//         title="Welcome back"
//         subtitle="Login to your account"
//         center
//       />
//       <TextInput
//         id = "email"
//         label="Email"
//         disabled={isLoading}
//         register={register}
//         errors={errors}
//         required
//       />
//       <TextInput
//         id = "password"
//         type="password"
//         label="Password"
//         disabled={isLoading}
//         register={register}
//         errors={errors}
//         required
//       />
//     </div>
//   )

//   const footerContent = (
//     <div className="flex flex-col gap-4 mt-3">
//       <hr />
//       <Button
//         outline
//         label="Continue with Google"
//         icon={FcGoogle}
//         onClick={handleGoogleSignIn}
//       />
//       <div className="text-neutral-500 text-center mt-4 font-light">
//         <div className="flex flex-row items-center gap-2 justify-center">
//           <div>
//             Don't have an account?
//           </div>
//           <div 
//             className="text-neutral-800 cursor-pointer hover:underline"
//             onClick={toggle}
//           >
//             Create an account
//           </div>
//         </div>
//       </div>
      
//     </div>
//   )

//   return ( 
//     <Modal
//       disabled = {isLoading}
//       isOpen = {loginModal.isOpen}
//       title="Login"
//       actionLabel="Continue"
//       onClose={loginModal.onClose}
//       onSubmit={handleSubmit(onSubmit)}
//       body={bodyContent}
//       footer={footerContent}
//     />
//    );
// }
 
// export default LoginModal;