// app/links/page.tsx

import prisma from "@/lib/prisma";
import Link from "next/link";
import { FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import AddEditLinkButton from "./AddEditLinkButton";


export default async function LinksList() {
    const links = await prisma.link.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Links List</h1>
                <AddEditLinkButton type="add" />
            </div>

            <table className="w-full text-left border border-gray-300 rounded-lg shadow-md">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="px-4 py-2 border-b border-gray-300">Title</th>
                        <th className="px-4 py-2 border-b border-gray-300">URL</th>
                        <th className="px-4 py-2 border-b border-gray-300">Category</th>
                        <th className="px-4 py-2 border-b border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {links.map((link) => (
                        <tr key={link.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border-b">{link.title}</td>
                            <td className="px-4 py-2 border-b">
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    {link.url}
                                </a>
                            </td>
                            <td className="px-4 py-2 border-b">{link.category}</td>
                            <td className="px-4 py-2 border-b">
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/links/${link.id}/edit`}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <FiEdit />
                                    </Link>
                                    <button
                                        className="text-red-600 hover:text-red-800"
                                        onClick={async () => {
                                            "use server";
                                            await prisma.link.delete({ where: { id: link.id } });
                                            window.location.reload();
                                        }}
                                    >
                                        <FiTrash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
