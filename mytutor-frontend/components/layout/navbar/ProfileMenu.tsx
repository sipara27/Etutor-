import { useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
import { useUserService } from "../../account/auth/UserService";
import { appURL } from "../../../utils/api";
import { Button } from "../../customs/custom-components/components";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {Image} from "antd";

function ProfileMenu(props: any) {
    const { setShowProfileMenu } = props;
    const user = useSelector((state: AppState) => state.user)
    const userService = useUserService()
    const router = useRouter();

    const handleLogout = () => {
        userService.logout().then(res=>{
            localStorage.removeItem(`${appURL}.token.authorizationData`)
            if(res){
                router.push('/login')
            }
        });
      }
    return <div className="top-36 right-2 fixed w-auto h-auto bg-white z-50 overflow-none shadow-md p-3">

        <div className="flex justify-start place-items-center gap-2 mb-3">
            <Link href='/profile' className='w-[60px] h-[60px] rounded-full bg-custom_orange-800 text-white text-lg shadow-sm flex justify-center place-items-center cursor-pointer'>
                {user.profile_picture ? <Image preview={false} src={user.profile_picture as string} alt="Image not found" className="w-29 lg:w-29 rounded-full border-white" /> : user.first_name.charAt(0).toUpperCase() + user.last_name.charAt(0).toUpperCase()}
            </Link>
            <div>
                <span className="text-xl">{user.first_name} {user.last_name}</span>
                <div className="text-sm text-gray-400">{user.email}</div>
            </div>

        </div>
        <hr />
        <div className="flex flex-col pt-3 gap-3 text-md">
            <Link href="/mycourse"> My Courses</Link>
            <Link href="/wishlist"> Wish List</Link>
            <Link href="/mycart"> My Cart </Link>
            <hr className="p-3" />
            <Link href="/messages" className="relative"> Messages<span className=" h-6 w-6   absolute top-0 right-1  text-center  bg-custom_orange-900 text-white rounded-[50%]">1</span></Link>
            <Link href="/notification" className="relative"> Notifications<span className=" h-6 w-6   absolute top-0 right-1  text-center  bg-custom_orange-900 text-white rounded-[50%]">2</span></Link>
            <Button onClick={handleLogout}> 
            Logout`</Button>

        </div>

    </div>;
}

export default ProfileMenu;