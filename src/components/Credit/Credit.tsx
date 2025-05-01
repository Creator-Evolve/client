"use client"
import { ICreditPackage, useBuyCreditPackageMutation, useGetCreditPackagesQuery } from '@/redux/api/credit'
import React, { useEffect, useState } from 'react'
import { CreditPackageCard } from './CreditPackageCard'
import { CustomCreditPackageCard } from './CustomCreditPackage'
import { FEATURES } from '../types/credit'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Swiper, SwiperSlide } from 'swiper/react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from 'lucide-react'
import 'swiper/css'
import { useRouter } from 'next/navigation'

import { loadStripe } from '@stripe/stripe-js'
import { toast } from '../ui/use-toast'

const allFeatures = Object.values(FEATURES)

const Credit = () => {
    const { data } = useGetCreditPackagesQuery()
    const [selectedPackage, setSelectedPackage] = useState<ICreditPackage | null>(null)
    const [packages, setPackages] = useState<(ICreditPackage & { plan: "monthly" | "yearly" })[]>([])
    const [buyCreditPackageApi] = useBuyCreditPackageMutation()
    const router = useRouter()
    const [showCheckOutModal, setShowCheckOutModal] = useState(false)

    useEffect(() => {
        if (data?.data) {
            setPackages(data.data.map((pkg: ICreditPackage) => ({ ...pkg, plan: "monthly" })))
        }
    }, [data?.data])

    const handlePurchase = (packageId: string) => {
        const selected = packages.find(pkg => pkg._id === packageId)
        if (selected) {
            setSelectedPackage(selected)
            setShowCheckOutModal(true)
        }
    }

    const handleCheckout = async () => {
        if (!selectedPackage?.priceId) {
            toast({
                title: "Error",
                description: "Invalid package",
                variant: "destructive",
                duration: 5000,
            })
            setShowCheckOutModal(false)
            return
        }
        try {
            const res = await buyCreditPackageApi(selectedPackage._id).unwrap()
            router.push(res.data)
        } catch (error) {
            setShowCheckOutModal(false)
            console.log(error);
        }
    };

    const handleCustomPurchase = (credits: number, features: string[]) => {
        // Here you would typically initiate the custom purchase process
        console.log(`Purchasing custom package: ${credits} credits, features: ${features.join(', ')}`)
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Purchase Credits</h1>
            <Tabs defaultValue="monthly" onValueChange={(value) => {
                setPackages(data?.data.map((pkg: ICreditPackage) => ({
                    ...pkg,
                    plan: value as "monthly" | "yearly",
                    price: value === "yearly" ? (pkg.price * 12) * 0.8 : pkg.price
                })) || [])
            }}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
                <TabsContent value="monthly">
                    <h2 className="text-xl font-bold mt-4 mb-2">Monthly Plans</h2>
                </TabsContent>
                <TabsContent value="yearly">
                    <h2 className="text-xl font-bold mt-4 mb-2">Yearly Plans (Save up to 20%!)</h2>
                </TabsContent>
            </Tabs>
            <Swiper
                spaceBetween={50}
                slidesPerView={3}
                scrollbar={{ draggable: true }}
                onSwiper={(swiper) => console.log(swiper)}
                onSlideChange={() => console.log('slide change')}
            >
                {packages && packages.length > 0 ? (
                    packages.map((pkg) => (
                        <SwiperSlide key={pkg._id}>
                            <CreditPackageCard
                                key={pkg._id}
                                package={pkg}
                                onPurchase={handlePurchase}
                                isSelected={selectedPackage?._id === pkg._id}
                            />
                        </SwiperSlide>
                    ))
                ) : (
                    <p>No packages available for the selected plan type.</p>
                )}

                <SwiperSlide key={"custom"}>
                    <CustomCreditPackageCard
                        onPurchase={handleCustomPurchase}
                        availableFeatures={allFeatures}
                    />
                </SwiperSlide>
            </Swiper>

            <Dialog open={showCheckOutModal} onOpenChange={setShowCheckOutModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Confirm Your Purchase</DialogTitle>
                        <DialogDescription className=" mt-2">
                            You&apos;re about to purchase the following package:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedPackage && (
                            <div className="bg-secondary p-4 rounded-lg">
                                <h3 className=" font-semibold mb-2">{selectedPackage.name}</h3>
                                <p className=" mb-2">{selectedPackage.credits} Credits</p>
                                <p className="text-2xl font-bold">${selectedPackage.price.toFixed(2)}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCheckOutModal(false)}>Cancel</Button>
                        <Button onClick={handleCheckout} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <ShoppingCart className="mr-2 h-4 w-4" /> Proceed to Checkout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Credit

