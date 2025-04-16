import BookPosts from '@/components/BookPosts';

export default function PostsPage() {
    // TODO: Replace with actual user ID from authentication context or session
    const userId = '0001'; // Example user ID, replace with actual logic
    return <BookPosts userId={userId} />;
}
