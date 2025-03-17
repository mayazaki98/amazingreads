import { supabase } from './supabase';

export const getAllBooks = async () => {
    const books = await supabase.from('books').select('*');
    return books;
};
