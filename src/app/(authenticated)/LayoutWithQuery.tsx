"use client"

import { useGetUserByIdQuery } from '@/redux/api/user';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { setUser } from '@/redux/slices/user';
import React, { useEffect } from 'react'
import SideBar from "@/components/sidebar/Sidebar";
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/constants/routes';

const LayoutWithQuery = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAppSelector((state) => state.user);
    const { data } = useGetUserByIdQuery(user?.id as string, { skip: !user?.id });
    const dispatch = useAppDispatch();
    const router = useRouter();

    useEffect(() => {
        if (data?.data) {
            dispatch(setUser(data.data))
        }
    }, [data, dispatch])

    if (!user?.id || !user?.access_token) {
        router.push(APP_ROUTES.SIGNIN);
        return;
    }
    return (
        <SideBar>
            {children}
        </SideBar>
    )
}

export default LayoutWithQuery