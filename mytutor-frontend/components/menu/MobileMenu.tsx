import { MenuItem } from "../../types/MenuItems";
import useMenuListService from "./menuItems";
import { IoMdAdd } from "react-icons/io";
import { FaMinus } from "react-icons/fa";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface InputProps{
    level?:number;
    menu?:MenuItem[];
    setShowSideNav: (value: boolean) => void
}

function MobileMenu(prop: InputProps) {
    const {menuList} = useMenuListService()
    const { level = 0, menu = menuList, setShowSideNav } = prop;
    const [ menuState, setMenuState ] = useState<MenuItem[]>(menu);
    const [url, setUrl] = useState("")
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams();
    const hash = window?.location.hash
    const link = pathname + (searchParams.size ? `?${searchParams}`: '') + hash;


    function update(idx: number) {
        const newMenuState = [ ...menuState ];
        newMenuState[ idx ].active = !newMenuState[ idx ].active;
        setMenuState(newMenuState);
        router.push(`/${url}`);
    }

    
    const handleClick = (link: string, id?: any) => {
        // router.push(link, {state: {id}})
    }

    return <div className={level ? '' : "py-7"}>
            <ul className={level ? 'transition-all duration-1000 ease-in' : "border-t border-solid border-custom_orange-100"}>
                {menuList.map((value: MenuItem, idx) => {
                    return value.visible && <li className="relative" key={value.id} >
                        <Link onClick={() => setShowSideNav(false)} href={value.link}>
                        <button  onClick={()=>{handleClick(value.link, value.id); setUrl(value.link)}} className={` mx-auto text-left py-4 px-5 border-b flex flex-col border-solid border-custom_orange-100 justify-center text-medium font-medium text-custom_black-200 `   
                            + (level ? level === 1 ? 'pl-10' : 'pl-14' : '')}>
                            <span>{value.name}</span>
                            {link == value.link && <span className="border-b-2 border-custom_orange-900 h-2 w-full"></span>}
                        </button>
                        </Link>
                        {value.children ? <span className="absolute right-5 top-3 cursor-pointer">
                            {value.active ? <i><FaMinus size={15} /></i> : <i><IoMdAdd size={20} /></i>}
                        </span> : ''}
                    </li>;
                })}
            </ul>
        </div>;
    }


export default MobileMenu;