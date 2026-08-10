import { Tooltip } from "antd";
import { FaPlus, FaRedo } from "react-icons/fa";

interface ListHeaderTypes {
    title: string,
    content?: any,
    addTitle?: string,
    add?: () => void,
    load?: () => void,
    hide?:boolean,
}

const ListHeader = (props: ListHeaderTypes) => {

    return <>
        <div className=" flex gap-6 items-center text-custom_orange-700 ">
            <span className="text-lg font-bold py-5 uppercase pr-8">{props.title}</span>
            {props.addTitle && !props.hide && <Tooltip placement='bottom' title={props.addTitle} ><FaPlus fontSize={17} className="text-gray-400 hover:text-custom_orange-700 cursor-pointer" onClick={props.add} /></Tooltip>}
            {props.load && <i onClick={props.load} className=" text-gray-400 hover:text-custom_orange-700  cursor-pointer"> <FaRedo /></i>}</div>
        {props.content && props.content}
        <div />
    </>
}


export default ListHeader;