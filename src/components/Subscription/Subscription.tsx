'use client';
import { Button } from '../ui/button';

type props = {
    priceId: string;
    price: string;
    description: string;
};
const SubscribeComponent = ({  price, description }: props) => {
    
    const handleSubmit = async () => {
        console.log("handleSubmit");
    };
    return (
        <div>
            Click Below button to get {description}
            <Button onClick={handleSubmit}>
                Upgrade in {price}
            </Button>
        </div>
    );
};
export default SubscribeComponent;