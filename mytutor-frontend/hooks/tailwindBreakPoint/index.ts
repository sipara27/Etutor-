// /hooks/tailwind.ts

import { create } from "@kodingdotninja/use-tailwind-breakpoint";
import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "../../tailwind.config";

const config = resolveConfig(tailwindConfig);

export const { useBreakpoint, useBreakpointEffect, useBreakpointValue } = create(config.theme.screens);

export const useGetBreakpoint = () => {
    const xxl = useBreakpoint('2xl')
    const xl = useBreakpoint('xl')
    const lg = useBreakpoint('lg')
    const md = useBreakpoint('md')
    const sm = useBreakpoint('sm')
    if(xxl){
        return '2xl'
    }
    if(xl){
        return 'xl'
    }
    if(lg){
        return 'lg'
    }
    if(md){
        return 'md'
    }
    if(sm){
        return 'sm'
    }
    return 'xl'
}