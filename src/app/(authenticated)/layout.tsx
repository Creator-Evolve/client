import SideBar from "@/components/sidebar/Sidebar";

export default function RootLayout({
    children,

}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <SideBar>
            {children}
        </SideBar>
    );
}
