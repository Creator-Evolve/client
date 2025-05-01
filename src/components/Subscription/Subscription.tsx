'use client';
import { useCreateStripeSessionMutation } from '@/redux/api/app';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '../ui/button';

type props = {
    priceId: string;
    price: string;
    description: string;
};
const SubscribeComponent = ({ priceId, price, description }: props) => {
    const [createStripeCheckoutApi] = useCreateStripeSessionMutation()
    const handleSubmit = async () => {
        const stripe = await loadStripe(
            process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
        );
        if (!stripe) {
            return;
        }
        try {
            const response = await createStripeCheckoutApi({ priceId }).unwrap()

            await stripe.redirectToCheckout({
                sessionId: response.data.id
            });
        } catch (error) {
            console.log(error);
        }
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