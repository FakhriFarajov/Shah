import { useEffect, useRef, useState } from "react";
import NavBar from "../components/custom/Navbar/navbar";
import { Card, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Footer from "../components/custom/footer";
import { FeatureSteps } from "@/components/custom/steps_to_sell";

function useCountUp(target: number, duration = 1000, decimals = 0) {
    const [count, setCount] = useState(0);
    const startTimestamp = useRef<number | null>(null);

    //Effect to handle the counting animation
    useEffect(() => {
        function step(timestamp: number) {
            if (!startTimestamp.current) startTimestamp.current = timestamp;
            const progress = Math.min(
                (timestamp - startTimestamp.current) / duration,
                1
            );
            setCount(progress * target);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setCount(target);
            }
        }
        requestAnimationFrame(step);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, duration]);

    return decimals > 0
        ? count.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        })
        : Math.floor(count).toLocaleString();
}

export default function LandingPage() {
    const animatedUsers = useCountUp(63500000, 2000);
    const animatedCommission = useCountUp(9, 2000, 1);
        const features = [
        {
            step: 'Step 1',
            title: 'Sign Up',
            content: 'Create your account and set up your seller profile in just a few easy steps.',
            image: 'https://i.pinimg.com/736x/08/8f/0a/088f0a8462a65c1efaecac2d74707690.jpg'
        },
        {
            step: 'Step 2',
            title: 'Get verified',
            content: 'Complete the verification process to ensure a secure trading environment.',
            image: 'https://i.pinimg.com/1200x/90/f8/05/90f8056503906ca4f745ea8b96dbb025.jpg'
        },
        {
            step: 'Step 3',
            title: 'List Products',
            content: 'Showcase your products to a global audience and start selling.',
            image: 'https://i.pinimg.com/1200x/95/09/03/950903645f8b7940aaf095c605d019ff.jpg'
        },
    ]

    return (
        <>
            <NavBar />
            <div className="relative bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] min-h-[600px] flex flex-col md:flex-row items-center justify-center px-8 py-20 gap-12 overflow-hidden">
                <div className="flex-1 flex flex-col justify-center items-start max-w-2xl z-10">
                    <h1 className="text-5xl md:text-6xl font-black text-[#0d47a1] mb-8 leading-tight drop-shadow-lg">
                        <span className="block">Expand Beyond Borders</span>
                        <span className="text-[#1976d2] block mt-2">Grow Your Brand Globally</span>
                    </h1>
                    <p className="text-xl text-[#263238] mb-8 font-medium">
                        Unlock new opportunities and connect with millions of buyers worldwide. Join Shah, the platform designed for ambitious sellers ready to make their mark.
                    </p>
                    <Button
                        size="lg"
                        className="bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-xl transition-all duration-200"
                    >
                        Get Started Now
                    </Button>
                </div>
                <div className=" flex flex-col items-center z-10">
                    <div className="rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg mb-6 border-4 border-[#1976d2] bg-white/80 mt-10">
                        <img
                            src="src\assets\images\man.png"
                            alt="Global business"
                            className="w-full h-[40rem] object-cover"
                        />
                        <div className="bg-white/90 px-8 py-6 text-[#263238] text-base rounded-b-3xl font-semibold">
                            "Shah is more than a marketplace—it's your launchpad to international success."
                        </div>
                    </div>
                    <div className="flex -space-x-5 mt-3">
                        {["https://randomuser.me/api/portraits/men/1.jpg", "https://randomuser.me/api/portraits/men/2.jpg", "https://randomuser.me/api/portraits/men/3.jpg", "https://randomuser.me/api/portraits/men/2.jpg", "https://randomuser.me/api/portraits/men/3.jpg"].map((i) => (
                            <img
                                key={i}
                                src={i}
                                alt={`User avatar ${i}`}
                                className="w-12 h-12 rounded-full border-2 border-white shadow-lg bg-gray-100 object-cover"
                            />
                        ))}
                    </div>
                </div>
                {/* Decorative shapes */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#1976d2]/20 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#42a5f5]/20 rounded-full blur-3xl -z-10" />
            </div>

            {/* Unique Features Section */}
            <section className="bg-[#f5faff] py-16 px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                    <Card className="rounded-3xl p-10 flex flex-col items-center bg-white/95 shadow-lg border-2 border-[#bbdefb]">
                        <CardTitle className="text-2xl font-extrabold mb-3 text-[#1976d2]">Instant Onboarding</CardTitle>
                        <CardContent className="text-[#263238] text-center text-lg p-0">
                            Start selling in minutes with our seamless registration and smart verification. No paperwork hassle, just opportunity.
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl p-10 flex flex-col items-center bg-white/95 shadow-lg border-2 border-[#bbdefb]">
                        <CardTitle className="text-2xl font-extrabold mb-3 text-[#1976d2]">Smart Analytics</CardTitle>
                        <CardContent className="text-[#263238] text-center text-lg p-0">
                            Track your growth with real-time insights and AI-powered recommendations tailored to your business.
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl p-10 flex flex-col items-center bg-white/95 shadow-lg border-2 border-[#bbdefb]">
                        <CardTitle className="text-2xl font-extrabold mb-3 text-[#1976d2]">Global Logistics</CardTitle>
                        <CardContent className="text-[#263238] text-center text-lg p-0">
                            Ship anywhere with our trusted partners and flexible delivery options. Focus on sales, we handle the rest.
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Animated Stats Section */}
            <section className="bg-gradient-to-r from-[#21213a] to-[#3949ab] py-20 px-4 text-white text-center">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-14">
                    <div className="text-left">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 drop-shadow">Shah by the Numbers</h2>
                        <p className="text-lg text-[#bbdefb] font-medium">Join a thriving community of sellers and buyers worldwide.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-7xl md:text-8xl font-extrabold drop-shadow-lg">
                            {animatedUsers}
                        </span>
                        <span className="text-lg mt-3 text-[#bbdefb]">active users per month</span>
                    </div>
                </div>
            </section>

            {/* Commission Highlight Section */}
            <section className="bg-[#e3f2fd] py-14 px-4">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="bg-white/95 rounded-3xl p-10 shadow-lg flex flex-col items-start border-2 border-[#bbdefb]">
                        <span className="text-xl font-bold text-[#1976d2] mb-3">Lowest Commission Fees</span>
                        <p className="text-[#263238] mb-4">Keep more of your earnings with our industry-leading low commission rates. Transparent, fair, and designed for your growth.</p>
                        <Button className="mt-2 bg-gradient-to-r from-[#1976d2] to-[#42a5f5] hover:from-[#1565c0] hover:to-[#1976d2] text-white px-8 py-3 rounded-xl font-semibold shadow-md">
                            See Details
                        </Button>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-7xl font-extrabold text-[#1976d2] drop-shadow-lg">
                            {animatedCommission}%
                        </span>
                        <span className="text-lg mt-2 text-[#1976d2]">average sales commission</span>
                    </div>
                </div>
            </section>

            {/* Sign Up Stepper */}

            {/* How It Works Section */}
            <section className="bg-[#f5faff] py-20 px-4">
                <h2 className="text-4xl md:text-5xl font-black mb-12 text-[#1976d2] text-center">How Shah Works</h2>
                <div className="flex flex-wrap justify-center gap-10">
                    {[
                        { icon: "👤", label: "Sign Up" },
                        { icon: "📦", label: "List Products" },
                        { icon: "🌍", label: "Go Global" },
                        { icon: "🚚", label: "Ship & Earn" },
                        { icon: "📈", label: "Track Growth" },
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center bg-white/95 rounded-2xl border-4 border-[#1976d2] w-28 h-28 justify-center shadow-lg"
                        >
                            <span className="text-4xl mb-2">{item.icon}</span>
                            <span className="text-sm font-bold text-[#1976d2]">{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>
            <div className="w-full bg-[#f5faff] py-8 flex flex-col items-center">
                <h1 className="text-2xl font-bold text-[#19222a] mb-6 text-center bg-[#f5faff] py-4">Ready to take your business global?</h1>

                {/* Step Descriptions */}
                <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center">
                    <FeatureSteps
                        features={features}
                        title="Your Journey Starts Here"
                        autoPlayInterval={4000}/>
                </div>
            </div>
            <Footer></Footer>
        </>
    );
}
