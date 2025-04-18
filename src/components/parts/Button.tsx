import React from 'react';

type ButtonProps = {
    label: string;
    onClick: () => void;
};

type ButtonCommonProps = ButtonProps & {
    className: string;
};

const Button: React.FC<ButtonCommonProps> = ({ label, className, onClick }) => {
    return (
        <button
            className={className}
            onClick={async (e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            {label}
        </button>
    );
};

export const PostButton: React.FC<ButtonProps> = ({ label, onClick }) => (
    <Button
        label={label}
        onClick={onClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
    />
);

export const PutButton: React.FC<ButtonProps> = ({ label, onClick }) => (
    <Button
        label={label}
        onClick={onClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
    />
);

export const DeleteButton: React.FC<ButtonProps> = ({ label, onClick }) => (
    <Button
        label={label}
        onClick={onClick}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
    />
);

export const CancelButton: React.FC<ButtonProps> = ({ label, onClick }) => (
    <Button
        label={label}
        onClick={onClick}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition cursor-pointer"
    />
);
