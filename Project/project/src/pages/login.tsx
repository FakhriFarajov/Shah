import LoginForm from "@/components/custom/loginForm";

export default function Login() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8">
                <LoginForm />
            </div>
        </div>
    );
}