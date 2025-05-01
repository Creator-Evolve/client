import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Zap, Sliders } from 'lucide-react'

interface CustomCreditPackageCardProps {
    onPurchase: (credits: number, features: string[]) => void
    availableFeatures: string[]
}

export function CustomCreditPackageCard({ onPurchase, availableFeatures }: CustomCreditPackageCardProps) {
    const [credits, setCredits] = useState(100)
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

    const handleFeatureToggle = (feature: string) => {
        setSelectedFeatures(prev =>
            prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
        )
    }

    return (
        <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-md ">
            <CardHeader className="bg-gradient-to-br from-secondary/10 to-secondary/5 pb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-bold">Custom Package</CardTitle>
                        <CardDescription className="mt-1.5">Tailor your own package</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-sm font-medium">
                        Customize
                    </Badge>
                </div>
                <div className="mt-4 flex items-center">
                    <Input
                        type="number"
                        value={credits}
                        onChange={(e) => setCredits(Number(e.target.value))}
                        className="text-2xl font-bold w-24 mr-2"
                        min={1}
                    />
                    <span className="text-2xl font-bold">Credits</span>
                </div>
            </CardHeader>
            <CardContent className="flex-grow pt-6 h-[150px] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-3">Select Features:</h3>
                <ul className="space-y-3">
                    {availableFeatures.map((feature) => (
                        <li key={feature} className="flex items-center">
                            <Checkbox
                                id={feature}
                                checked={selectedFeatures.includes(feature)}
                                onCheckedChange={() => handleFeatureToggle(feature)}
                            />
                            <Label htmlFor={feature} className="ml-2 capitalize text-sm">
                                {feature.replace(/_/g, ' ')}
                            </Label>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="pt-6">
                <Button
                    className="w-full text-base font-semibold py-6"
                    onClick={() => onPurchase(credits, selectedFeatures)}
                    variant="default"
                >
                    <Sliders className="mr-2 h-5 w-5" />
                    Create Custom Package
                </Button>
            </CardFooter>
        </Card>
    )
}

