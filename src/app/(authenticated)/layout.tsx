import LayoutWithQuery from "./LayoutWithQuery";

export default function RootLayout({
    children,

}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <LayoutWithQuery>
            {children}
        </LayoutWithQuery>
    );
}
