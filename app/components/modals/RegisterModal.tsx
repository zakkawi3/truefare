// 'use client';

// import axios from 'axios';
// import { AiFillGithub } from 'react-icons/ai';
// import { FcGoogle } from "react-icons/fc";
// import { useCallback, useState } from "react";

// import {
//   FieldValues,
//   SubmitHandler,
//   useForm
// } from 'react-hook-form';

// import useRegisterModal from "@/app/hooks/useRegisterModal";
// import Modal from "./Modal";
// // import Heading from "../heading";
// // import Input from "../inputs/textInput";
// // import toast from "react-hot-toast";
// // import Button from "../button";
// // import useLoginModal from "@/app/hooks/useLoginModal";
// // import { useRouter } from "next/navigation";

// const RegisterModal = () => {
//   const registerModal = useRegisterModal();
// //   const loginModal = useLoginModal();
//    const [isLoading, setIsLoading] = useState(false);
// //   const router = useRouter()

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: {
//       errors,
//     }
//   } = useForm<FieldValues>({
//     defaultValues: {
//       name: '',
//       email: '',
//       password: ''
//   }
//   });

//   const onSubmit: SubmitHandler<FieldValues> = async (data) => {
//     toast.success('Logged in successfully!');
//     console.log('data:', data);
//     reset();
//     registerModal.onClose();
//   };

//   const toggle = useCallback(() => {
//     registerModal.onClose();
//     loginModal.onOpen();
//   }, [loginModal, registerModal]);

//   const handleGoogleSignIn = async () => {

//     toast.success('Logged in with Google');
//     registerModal.onClose();
//   };

//   const bodyContent = (
//     <div className="flex flex-col gap-4">
//       <Heading
//         title="Welcome"
//         subtitle="Create an account"
//         center
//       />
//       <Input
//         id = "email"
//         label="Email"
//         disabled={isLoading}
//         register={register}
//         errors={errors}
//         required
//       />
//       <Input
//         id = "name"
//         label="Name"
//         disabled={isLoading}
//         register={register}
//         errors={errors}
//         required
//       />
//       <Input
//         id = "password"
//         type="password"
//         label="Password"
//         disabled={isLoading}
//         register={register}
//         errors={errors}
//         required
//       />
//     </div>
//   );

//   const footerContent = (
//     <div className="flex flex-col gap-4 mt-3">
//       <hr />
//       <Button
//         outline
//         label="Continue with Google"
//         icon={FcGoogle}
//         onClick={handleGoogleSignIn}
//       />
//       <div className="text-neutral-500 text-body text-center mt-4 font-light">
//         <div className="flex flex-row items-center gap-2 justify-center">
//           <div>
//             Already have and account?
//           </div>
//           <div 
//             className="text-black text-body cursor-pointer hover:underline"
//             onClick={toggle}
//           >
//             Log in
//           </div>
//         </div>
//       </div>
      
//     </div>
//   )

//   return ( 
//     <Modal
//       disabled = {isLoading}
//       isOpen = {registerModal.isOpen}
//       title="Register"
//       actionLabel="Continue"
//       onClose={registerModal.onClose}
//       onSubmit={handleSubmit(onSubmit)}
//       body={bodyContent}
//       footer={footerContent}
//     />
//    );
// }
 
// export default RegisterModal;