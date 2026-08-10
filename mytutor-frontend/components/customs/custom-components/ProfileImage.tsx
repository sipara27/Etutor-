import {Image} from "antd";

interface Props {
    image?: string;
    name?: string;
}


export const ProfileImage = (props: Props) => {

    return <div className="rounded-full flex items-center min-w-16 w-16 h-16 mt-1 bg-gray-200 text-custom_orange-800 text-5xl justify-center">
        { props.image ? <Image preview={false} src={props.image}  alt="Image not found" /> :
            <div className="text-2xl font-medium">{props.name!.slice(0,1)}</div>
        }
    </div>

}