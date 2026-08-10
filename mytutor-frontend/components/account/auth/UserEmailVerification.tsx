"use client"
import CustomButton from "../../customs/custom-button/CustomButton";
import { useUserService } from "./UserService";
import { UserVerificationCode } from "../../../types/UserItem";
import useTranslation from "../../../utils/translation";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import useLoading from "../../customs/loading/LoadingHook";
import Loading from "../../customs/loading/Loading";
import { useParams, useRouter } from "next/navigation";
import { message } from "antd";

function UserEmailVerification() {
    const { register, setError, handleSubmit, formState: { errors } } = useForm<UserVerificationCode>();
    const [isVerified, setIsVerified] = useState(false);
    const [isVerificationError, setIsVerificationError] = useState(false);
    const navigator = useRouter();
    const userService = useUserService()
    const loading = useLoading()
    const {translate} = useTranslation()
    
    let params = useParams<{code:string}>();
    
    const onSubmit: SubmitHandler<UserVerificationCode>  = (data) => {
        loading.startLoading()
        userService.emailVerificationCode(params?.code as unknown as UserVerificationCode).then(
            ({data: value}) => {
                if (value.refresh_token) {
                    loading.stopLoading()
                    navigator.push('/login')
                }
                setIsVerified(true)
                navigator.push('/login')
                loading.stopLoading()
                message.info("Your email is verified!")
            }
        ).catch(error =>
            {
                const errors = error.response.data.error.details;
                for (const err in errors){
                    if (err === 'non_field_errors'){
                        setError('root', {message: errors[err]})
                        setIsVerificationError(true)
                    }else {
                        setError(err as keyof UserVerificationCode, {message: errors[err]})
                        setIsVerificationError(true)
                    }
                }
            loading.stopLoading()
        })
    };


    return <>
    <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-5 relative">
            <Loading {...loading} />
            {
                !isVerified && !isVerificationError
                ?<CustomButton type="submit" 
                // key={1}
                 text={isVerified?translate("verified"):isVerificationError?translate('verfication_error'):translate("verify")}/>
                :<div className={"border border-l-8 border-l-custom_orange-900 text-center py-6 h-20   text-custom_orange-900 border-solid border-custom_orange-100" + 
                "transition-all duration-300 ease-in group hover:border-custom_orange-100 bg-custom_orange-100  hover:border-l-custom_orange-900"
                }>
                {isVerified?<h1>{translate("verified")}</h1>:isVerificationError?<h1>{translate('verfication_error')}</h1>:""}
                </div>
            }
            
        </div>
    </form>
    </>;
}

export default UserEmailVerification;