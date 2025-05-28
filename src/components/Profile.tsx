import { User } from '@prisma/client';
import Image from 'next/image';

interface ProfileProps {
    user: User;
    getDisplayName: (user: User) => string;
    onClose: () => void;
}

const Profile = ({ user, getDisplayName, onClose }: ProfileProps) => {
    return (
        <div onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xs relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    onClick={onClose}
                    aria-label="閉じる"
                >
                    ×
                </button>
                {user.avatarUrl && (
                    <div className="flex justify-center mb-4">
                        <Image
                            src={user.avatarUrl}
                            alt={getDisplayName(user)}
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                        />
                    </div>
                )}
                <h3 className="text-lg font-bold text-center mb-2">{getDisplayName(user)}</h3>
                <p className="text-gray-600 text-center whitespace-pre-line">
                    {user.profile || 'プロフィール文はありません。'}
                </p>
            </div>
        </div>
    );
};

export default Profile;
