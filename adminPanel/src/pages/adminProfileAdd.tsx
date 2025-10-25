import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminProfile {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    citizenship: string;
    addressCountry: string;
}

const countryList = [
  "Azerbaijan", "Turkey", "USA", "UK", "Germany", "France", "Russia", "China", "India", "Japan"
];

export default function AdminProfilesPage() {
    const [admins, setAdmins] = useState<AdminProfile[]>([
        { id: 1, name: "Alice Admin", surname: "Smith", email: "alice@site.com", phone: "+994501234567", citizenship: "Azerbaijan", addressCountry: "Azerbaijan" },
        { id: 2, name: "Bob Boss", surname: "Johnson", email: "bob@site.com", phone: "+905551234567", citizenship: "Turkey", addressCountry: "Turkey" },
    ]);
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState<AdminProfile | null>(null);
    const [form, setForm] = useState<Omit<AdminProfile, "id">>({ name: "", surname: "", email: "", phone: "", citizenship: "Azerbaijan", addressCountry: "Azerbaijan" });

    function openAdd() {
        setEditing(null);
        setForm({ name: "", surname: "", email: "", phone: "", citizenship: "Azerbaijan", addressCountry: "Azerbaijan" });
        setIsOpen(true);
    }
    function openEdit(admin: AdminProfile) {
        setEditing(admin);
        setForm({ name: admin.name, surname: admin.surname, email: admin.email, phone: admin.phone, citizenship: admin.citizenship, addressCountry: admin.addressCountry });
        setIsOpen(true);
    }
    function handleSave() {
        if (!form.name.trim() || !form.surname.trim() || !form.email.trim() || !form.phone.trim()) return;
        if (editing) {
            setAdmins(admins.map(a => a.id === editing.id ? { ...editing, ...form } : a));
        } else {
            setAdmins([...admins, { ...form, id: Date.now() }]);
        }
        setIsOpen(false);
    }
    function handleDelete(id: number) {
        setAdmins(admins.filter(a => a.id !== id));
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="max-w-4xl mx-auto mb-8">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Admin Profiles</h1>
                        <Button onClick={openAdd} className="mb-4">Add Admin</Button>
                        <div className="flex flex-col gap-6">
                            {admins.map(admin => (
                                <div key={admin.id} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 flex items-center justify-center shadow-lg mb-2 md:mb-0">
                                        <span className="text-2xl font-bold text-white">{admin.name[0]}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between w-full">
                                        <div className="text-left md:w-1/3">
                                            <div className="font-bold text-xl text-gray-900">{admin.name} {admin.surname}</div>
                                            <div className="text-gray-500 text-sm mt-1">{admin.email}</div>
                                            <div className="text-gray-500 text-sm mt-1">{admin.phone}</div>
                                            <div className="text-gray-500 text-sm mt-1">Citizenship: {admin.citizenship}</div>
                                            <div className="text-gray-500 text-sm mt-1">Address Country: {admin.addressCountry}</div>
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-3 md:mt-0 md:w-1/3 justify-end">
                                            <Button variant="outline" onClick={() => openEdit(admin)}>Edit</Button>
                                            <Button variant="destructive" onClick={() => handleDelete(admin.id)}>Delete</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editing ? "Edit Admin" : "Add Admin"}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-2">
                                <div className="md:flex md:gap-4">
                                    <div className="flex-1">
                                        <Label>Name</Label>
                                        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" />
                                    </div>
                                    <div className="flex-1 mt-2 md:mt-0">
                                        <Label>Surname</Label>
                                        <Input value={form.surname} onChange={e => setForm(f => ({ ...f, surname: e.target.value }))} placeholder="Surname" />
                                    </div>
                                </div>
                                <div className="md:flex md:gap-4">
                                    <div className="flex-1">
                                        <Label>Email</Label>
                                        <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
                                    </div>
                                    <div className="flex-1 mt-2 md:mt-0">
                                        <Label>Phone</Label>
                                        <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" />
                                    </div>
                                </div>
                                <div className="md:flex md:gap-4">
                                    <div className="flex-1">
                                        <Label>Citizenship</Label>
                                        <select className="w-full border rounded px-3 py-2" value={form.citizenship} onChange={e => setForm(f => ({ ...f, citizenship: e.target.value }))}>
                                            {countryList.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-1 mt-2 md:mt-0">
                                        <Label>Address Country</Label>
                                        <select className="w-full border rounded px-3 py-2" value={form.addressCountry} onChange={e => setForm(f => ({ ...f, addressCountry: e.target.value }))}>
                                            {countryList.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="ghost" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave}>{editing ? "Save" : "Add"}</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    );
}
