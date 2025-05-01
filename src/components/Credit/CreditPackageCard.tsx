import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap } from 'lucide-react'
import { ICreditPackage } from "@/redux/api/credit"

interface CreditPackageCardProps {
    package: ICreditPackage & { plan: "monthly" | "yearly" }
    onPurchase: (packageId: string) => void
    isSelected: boolean
}

export function CreditPackageCard({ package: pkg, onPurchase, isSelected }: CreditPackageCardProps) {
    const isYearly = pkg.plan === "yearly"

    return (
        <Card className={`flex flex-col overflow-hidden transition-all duration-300 ${isSelected ? 'border-primary shadow-lg' : 'hover:border-primary/50 hover:shadow-md'
            } w-full`}>
            <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 pb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                        <CardDescription className="mt-1.5">{pkg.credits} Credits</CardDescription>
                    </div>
                    <Badge variant={isSelected ? "default" : "secondary"} className="text-sm font-medium">
                        {isSelected ? "Selected" : "Popular"}
                    </Badge>
                </div>
                <p className="text-4xl font-bold mt-4">
                    ${pkg.price.toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                        / {isYearly ? "year" : "month"}
                    </span>
                </p>
                {isYearly && (
                    <p className="text-sm text-muted-foreground mt-2">
                        Billed annually (save 20%)
                    </p>
                )}
            </CardHeader>
            <CardContent className="flex-grow pt-6 h-[150px] overflow-y-auto">
                <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                            <Check className="mr-2 h-5 w-5 text-primary" />
                            <span className="capitalize text-sm">{feature.replace(/_/g, ' ')}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="pt-6">
                <Button
                    className="w-full text-base font-semibold py-6"
                    onClick={() => onPurchase(pkg._id)}
                    variant={isSelected ? "secondary" : "default"}
                >
                    <Zap className="mr-2 h-5 w-5" />
                    {isSelected ? "Selected Package" : "Purchase Package"}
                </Button>
            </CardFooter>
        </Card>
    )
}

