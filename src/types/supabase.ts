export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          email: string | null
          measurements: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          measurements?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          measurements?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          brand: string
          price: number
          original_price: number | null
          description: string | null
          category: string
          images: string[]
          model_3d_url: string | null
          has_ar: boolean
          is_new: boolean
          is_featured: boolean
          stock: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand: string
          price: number
          original_price?: number | null
          description?: string | null
          category: string
          images?: string[]
          model_3d_url?: string | null
          has_ar?: boolean
          is_new?: boolean
          is_featured?: boolean
          stock?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string
          price?: number
          original_price?: number | null
          description?: string | null
          category?: string
          images?: string[]
          model_3d_url?: string | null
          has_ar?: boolean
          is_new?: boolean
          is_featured?: boolean
          stock?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
