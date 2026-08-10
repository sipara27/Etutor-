import { generateUniqueKey } from "@/utils/func_utils";

interface InputProps {
    msg?: string;
    key?: number;
}

function CustomInputError({msg, key}: InputProps) {

    return (<p key={generateUniqueKey()} className="my-2 text-wrap w-64 text-sm text-red-600 dark:text-red-500">{msg}</p>);
}

export default CustomInputError;