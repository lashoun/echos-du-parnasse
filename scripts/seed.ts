/**
 * Seed script for Échos du Parnasse.
 *
 * Inserts curated French public-domain poems into Supabase.
 * Uses the secret key for admin access.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SECRET_KEY=... pnpm seed
 *
 * Or with a .env.local file:
 *   pnpm dotenv -- pnpm seed
 *
 * Environment variables:
 *   SUPABASE_URL       – Supabase project URL
 *   SUPABASE_SECRET_KEY – Secret key (bypasses RLS, sb_secret_...)
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.local (same file Next.js uses)
dotenv.config({ path: '.env.local' })

// ── Config ────────────────────────────────────────────────────────────

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const secretKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !secretKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, secretKey)

// ── Curated data ──────────────────────────────────────────────────────

interface SeedAuthor {
  name: string
  birth_year: number | null
  death_year: number | null
  bio: string | null
}

interface SeedPoem {
  title: string
  content: string
  language: string
}

const authors: SeedAuthor[] = [
  {
    name: 'Charles Baudelaire',
    birth_year: 1821,
    death_year: 1867,
    bio: 'Poète français, figure majeure du symbolisme et auteur des Fleurs du mal.',
  },
  {
    name: 'Arthur Rimbaud',
    birth_year: 1854,
    death_year: 1891,
    bio: "Poète français, précurseur du surréalisme, auteur d'Une saison en enfer et des Illuminations.",
  },
  {
    name: 'Paul Verlaine',
    birth_year: 1844,
    death_year: 1896,
    bio: 'Poète français, figure du symbolisme et du décadentisme.',
  },
]

const poemsByAuthor: Record<string, SeedPoem[]> = {
  'Charles Baudelaire': [
    {
      title: "L'Albatros",
      language: 'fr',
      content: `Souvent, pour s'amuser, les hommes d'équipage
Prennent des albatros, vastes oiseaux des mers,
Qui suivent, indolents compagnons de voyage,
Le navire glissant sur les gouffres amers.

À peine les ont-ils déposés sur les planches,
Que ces rois de l'azur, maladroits et honteux,
Laissent piteusement leurs grandes ailes blanches
Comme des avirons traîner à côté d'eux.

Ce voyageur ailé, comme il est gauche et veule !
Lui, naguère si beau, qu'il est comique et laid !
L'un agace son bec avec un brûle-gueule,
L'autre mime, en boitant, l'infirme qui volait !

Le Poète est semblable au prince des nuées
Qui hante la tempête et se rit de l'archer ;
Exilé sur le sol au milieu des huées,
Ses ailes de géant l'empêchent de marcher.`,
    },
    {
      title: 'Correspondances',
      language: 'fr',
      content: `La Nature est un temple où de vivants piliers
Laissent parfois sortir de confuses paroles ;
L'homme y passe à travers des forêts de symboles
Qui l'observent avec des regards familiers.

Comme de longs échos qui de loin se confondent
Dans une ténébreuse et profonde unité,
Vaste comme la nuit et comme la clarté,
Les parfums, les couleurs et les sons se répondent.

Il est des parfums frais comme des chairs d'enfants,
Doux comme les hautbois, verts comme les prairies,
— Et d'autres, corrompus, riches et triomphants,

Ayant l'expansion des choses infinies,
Comme l'ambre, le musc, le benjoin et l'encens,
Qui chantent les transports de l'esprit et des sens.`,
    },
    {
      title: 'Recueillement',
      language: 'fr',
      content: `Sois sage, ô ma Douleur, et tiens-toi plus tranquille.
Tu réclamais le Soir ; il descend ; le voici :
Une atmosphère obscure enveloppe la ville,
Aux uns portant la paix, aux autres le souci.

Pendant que des mortels la multitude vile,
Sous le fouet du Plaisir, ce bourreau sans merci,
Va cueillir des remords dans la fête servile,
Ma Douleur, donne-moi la main ; viens par ici,

Loin d'eux. Vois se pencher les défuntes Années,
Sur les balcons du ciel, en robes surannées ;
Surgir du fond des eaux le Regret souriant ;

Le Soleil moribond s'endormir sous une arche,
Et, comme un long linceul traînant à l'Orient,
Entends, ma chère, entends la douce Nuit qui marche.`,
    },
  ],
  'Arthur Rimbaud': [
    {
      title: 'Le Dormeur du val',
      language: 'fr',
      content: `C'est un trou de verdure où chante une rivière
Accrochant follement aux herbes des haillons
D'argent ; où le soleil, de la montagne fière,
Luit : c'est un petit val qui mousse de rayons.

Un soldat jeune, bouche ouverte, tête nue,
Et la nuque baignant dans le frais cresson bleu,
Dort ; il est étendu dans l'herbe, sous la nue,
Pâle dans son lit vert où la lumière pleut.

Les pieds dans les glaïeuls, il dort. Souriant comme
Sourirait un enfant malade, il fait un somme :
Nature, berce-le chaudement : il a froid.

Les parfums ne font pas frissonner sa narine ;
Il dort dans le soleil, la main sur sa poitrine
Tranquille. Il a deux trous rouges au côté droit.`,
    },
    {
      title: 'Voyelles',
      language: 'fr',
      content: `A noir, E blanc, I rouge, U vert, O bleu : voyelles,
Je dirai quelque jour vos naissances latentes :
A, noir corset velu des mouches éclatantes
Qui bombinent autour des puanteurs cruelles,

Golfes d'ombre ; E, candeurs des vapeurs et des tentes,
Lances des glaciers fiers, rois blancs, frissons d'ombrelles ;
I, pourpres, sang craché, rire des lèvres belles
Dans la colère ou les ivresses pénitentes ;

U, cycles, vibrements divins des mers virides,
Paix des pâtis semés d'animaux, paix des rides
Que l'alchimie imprime aux grands fronts studieux ;

O, suprême Clairon plein des strideurs étranges,
Silences traversés des Mondes et des Anges :
— O l'Oméga, rayon violet de Ses Yeux !`,
    },
    {
      title: 'Ma Bohème',
      language: 'fr',
      content: `Je m'en allais, les poings dans mes poches crevées ;
Mon paletot aussi devenait idéal ;
J'allais sous le ciel, Muse ! et j'étais ton féal ;
Oh ! là là ! que d'amours splendides j'ai rêvées !

Mon unique culotte avait un large trou.
— Petit-Poucet rêveur, j'égrenais dans ma course
Des rimes. Mon auberge était à la Grande-Ourse.
— Mes étoiles au ciel avaient un doux frou-frou.

Et je les écoutais, assis au bord des routes,
Ces bons soirs de septembre où je sentais des gouttes
De rosée à mon front, comme un vin de vigueur ;

Où, rimant au milieu des ombres fantastiques,
Comme des lyres, je tirais les élastiques
De mes souliers blessés, un pied près de mon cœur !`,
    },
  ],
  'Paul Verlaine': [
    {
      title: "Chanson d'automne",
      language: 'fr',
      content: `Les sanglots longs
Des violons
De l'automne
Blessent mon cœur
D'une langueur
Monotone.

Tout suffocant
Et blême, quand
Sonne l'heure,
Je me souviens
Des jours anciens
Et je pleure ;

Et je m'en vais
Au vent mauvais
Qui m'emporte
Deçà, delà,
Pareil à la
Feuille morte.`,
    },
    {
      title: 'Il pleure dans mon cœur',
      language: 'fr',
      content: `Il pleure dans mon cœur
Comme il pleut sur la ville ;
Quelle est cette langueur
Qui pénètre mon cœur ?

Ô bruit doux de la pluie
Par terre et sur les toits !
Pour un cœur qui s'ennuie,
Ô le chant de la pluie !

Il pleure sans raison
Dans ce cœur qui s'écœure.
Quoi ! nulle trahison ?…
Ce deuil est sans raison.

C'est bien la pire peine
De ne savoir pourquoi
Sans amour et sans haine
Mon cœur a tant de peine !`,
    },
    {
      title: 'Mon rêve familier',
      language: 'fr',
      content: `Je fais souvent ce rêve étrange et pénétrant
D'une femme inconnue, et que j'aime, et qui m'aime,
Et qui n'est, chaque fois, ni tout à fait la même
Ni tout à fait une autre, et m'aime et me comprend.

Car elle me comprend, et mon cœur, transparent
Pour elle seule, hélas ! cesse d'être un problème
Pour elle seule, et les moiteurs de mon front blême,
Elle seule les sait rafraîchir, en pleurant.

Est-elle brune, blonde ou rousse ? — Je l'ignore.
Son nom ? Je me souviens qu'il est doux et sonore
Comme ceux des aimés que la Vie exila.

Son regard est pareil au regard des statues,
Et pour sa voix, lointaine, et calme, et grave, elle a
L'inflexion des voix chères qui se sont tues.`,
    },
  ],
}

// ── Seed function ─────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding Échos du Parnasse…\n')

  for (const authorData of authors) {
    // Find existing author or insert
    const { data: existing } = await supabase
      .from('authors')
      .select('id')
      .eq('name', authorData.name)
      .maybeSingle()

    let authorId: string | null = existing?.id ?? null

    if (!authorId) {
      const { data: inserted, error: insertError } = await supabase
        .from('authors')
        .insert({
          name: authorData.name,
          birth_year: authorData.birth_year,
          death_year: authorData.death_year,
          bio: authorData.bio,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error(
          `❌ Failed to insert author "${authorData.name}":`,
          insertError.message,
        )
        continue
      }
      authorId = inserted.id
    }

    console.log(`✅ Author: ${authorData.name} (${authorId})`)

    // Insert poems for this author
    const poems = poemsByAuthor[authorData.name] ?? []
    for (const poemData of poems) {
      // Check if poem already exists (by title + author)
      const { data: existingPoem } = await supabase
        .from('poems')
        .select('id')
        .eq('title', poemData.title)
        .eq('author_id', authorId)
        .maybeSingle()

      if (existingPoem) {
        console.log(`  ✅ Poem: ${poemData.title} (already exists)`)
        continue
      }

      const { error: poemError } = await supabase.from('poems').insert({
        title: poemData.title,
        content: poemData.content,
        language: poemData.language,
        author_id: authorId,
      })

      if (poemError) {
        console.error(
          `  ❌ Failed to insert poem "${poemData.title}":`,
          poemError.message,
        )
      } else {
        console.log(`  ✅ Poem: ${poemData.title}`)
      }
    }
  }

  console.log('\n✨ Seeding complete!')
}

seed().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
