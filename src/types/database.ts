export interface Database {
  public: {
    Tables: {
      authors: {
        Row: Author
        Insert: Omit<Author, 'id' | 'created_at'>
        Update: Partial<Omit<Author, 'id'>>
      }
      collections: {
        Row: Collection
        Insert: Omit<Collection, 'id' | 'created_at'>
        Update: Partial<Omit<Collection, 'id'>>
      }
      poems: {
        Row: Poem
        Insert: Omit<Poem, 'id' | 'created_at'>
        Update: Partial<Omit<Poem, 'id'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id'>
        Update: Partial<Omit<Tag, 'id'>>
      }
      poem_tags: {
        Row: PoemTag
        Insert: PoemTag
        Update: Partial<PoemTag>
      }
      user_poem_status: {
        Row: UserPoemStatus
        Insert: Omit<UserPoemStatus, 'updated_at'>
        Update: Partial<Omit<UserPoemStatus, 'user_id' | 'poem_id'>>
      }
    }
    Views: Record<string, never>
    Functions: {
      get_random_poem_id: {
        Args: {
          p_author_id?: string
          p_collection_id?: string
          p_tag_id?: string
        }
        Returns: string
      }
    }
    Enums: Record<string, never>
    Relationships: {
      authors: {
        foreign_key_collections_author_id: {
          referencedEntity: 'collections'
          columns: ['id']
          referencedColumns: ['author_id']
        }
      }
      collections: {
        foreign_key_poems_collection_id: {
          referencedEntity: 'poems'
          columns: ['id']
          referencedColumns: ['collection_id']
        }
      }
      poems: {
        foreign_key_poems_author_id: {
          referencedEntity: 'authors'
          columns: ['author_id']
          referencedColumns: ['id']
        }
        foreign_key_poems_collection_id: {
          referencedEntity: 'collections'
          columns: ['collection_id']
          referencedColumns: ['id']
        }
      }
      poem_tags: {
        foreign_key_poem_tags_poem_id: {
          referencedEntity: 'poems'
          columns: ['poem_id']
          referencedColumns: ['id']
        }
        foreign_key_poem_tags_tag_id: {
          referencedEntity: 'tags'
          columns: ['tag_id']
          referencedColumns: ['id']
        }
      }
      user_poem_status: {
        foreign_key_user_poem_status_poem_id: {
          referencedEntity: 'poems'
          columns: ['poem_id']
          referencedColumns: ['id']
        }
      }
    }
  }
}

export interface Author {
  id: string
  name: string
  birth_year: number | null
  death_year: number | null
  bio: string | null
  created_at: string
}

export interface Collection {
  id: string
  title: string
  author_id: string | null
  year: number | null
  description: string | null
  created_at: string
}

export interface Poem {
  id: string
  title: string
  content: string
  author_id: string | null
  collection_id: string | null
  position_in_collection: number | null
  language: string
  created_at: string
}

export interface Tag {
  id: string
  name: string
}

export interface PoemTag {
  poem_id: string
  tag_id: string
}

export interface UserPoemStatus {
  user_id: string
  poem_id: string
  is_read: boolean
  is_favorite: boolean
  updated_at: string
}

/** Helper type for a poem joined with its author. */
export interface PoemWithAuthor extends Poem {
  authors: Author | null
}
