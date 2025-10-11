import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Función para generar hash code de película
function generateMovieHash(title: string, year: number): string {
  const normalized = title.toLowerCase().replace(/\s+/g, '') + year.toString();
  return crypto.createHash('sha256').update(normalized).digest('hex').substring(0, 16);
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Películas precargadas
  const movies = [
    {
      title: 'The Shawshank Redemption',
      year: 1994,
      director: 'Frank Darabont',
      cast: JSON.stringify(['Tim Robbins', 'Morgan Freeman', 'Bob Gunton']),
      synopsis: 'Dos hombres encarcelados se unen a lo largo de varios años, encontrando consuelo y eventual redención a través de actos de decencia común.',
      genre: 'Drama',
      posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'
    },
    {
      title: 'The Godfather',
      year: 1972,
      director: 'Francis Ford Coppola',
      cast: JSON.stringify(['Marlon Brando', 'Al Pacino', 'James Caan']),
      synopsis: 'El patriarca envejecido de una dinastía del crimen organizado transfiere el control de su imperio clandestino a su reacio hijo.',
      genre: 'Crime',
      posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg'
    },
    {
      title: 'The Dark Knight',
      year: 2008,
      director: 'Christopher Nolan',
      cast: JSON.stringify(['Christian Bale', 'Heath Ledger', 'Aaron Eckhart']),
      synopsis: 'Cuando la amenaza conocida como el Joker emerge de su misterioso pasado, causa estragos y caos en la gente de Gotham.',
      genre: 'Action',
      posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
    },
    {
      title: 'Pulp Fiction',
      year: 1994,
      director: 'Quentin Tarantino',
      cast: JSON.stringify(['John Travolta', 'Uma Thurman', 'Samuel L. Jackson']),
      synopsis: 'Las vidas de dos sicarios de la mafia, un boxeador, la esposa de un gángster y dos bandidos se entrelazan en cuatro historias de violencia y redención.',
      genre: 'Crime',
      posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg'
    },
    {
      title: 'Forrest Gump',
      year: 1994,
      director: 'Robert Zemeckis',
      cast: JSON.stringify(['Tom Hanks', 'Robin Wright', 'Gary Sinise']),
      synopsis: 'Las presidencias de Kennedy y Johnson, la guerra de Vietnam, el escándalo Watergate y otros eventos históricos se desarrollan desde la perspectiva de un hombre de Alabama con un coeficiente intelectual de 75.',
      genre: 'Drama',
      posterUrl: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg'
    },
    {
      title: 'Inception',
      year: 2010,
      director: 'Christopher Nolan',
      cast: JSON.stringify(['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Ellen Page']),
      synopsis: 'Un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños recibe la tarea inversa de plantar una idea en la mente de un CEO.',
      genre: 'Sci-Fi',
      posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'
    },
    {
      title: 'The Matrix',
      year: 1999,
      director: 'Lana Wachowski, Lilly Wachowski',
      cast: JSON.stringify(['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss']),
      synopsis: 'Un hacker de computadoras aprende de misteriosos rebeldes sobre la verdadera naturaleza de su realidad y su papel en la guerra contra sus controladores.',
      genre: 'Sci-Fi',
      posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg'
    },
    {
      title: 'Goodfellas',
      year: 1990,
      director: 'Martin Scorsese',
      cast: JSON.stringify(['Robert De Niro', 'Ray Liotta', 'Joe Pesci']),
      synopsis: 'La historia del ascenso y caída de Henry Hill y sus amigos a través de tres décadas de la mafia.',
      genre: 'Crime',
      posterUrl: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg'
    },
    {
      title: 'Interstellar',
      year: 2014,
      director: 'Christopher Nolan',
      cast: JSON.stringify(['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain']),
      synopsis: 'Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento de asegurar la supervivencia de la humanidad.',
      genre: 'Sci-Fi',
      posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
    },
    {
      title: 'The Silence of the Lambs',
      year: 1991,
      director: 'Jonathan Demme',
      cast: JSON.stringify(['Jodie Foster', 'Anthony Hopkins', 'Lawrence A. Bonney']),
      synopsis: 'Una joven cadete del FBI debe recibir la ayuda de un caníbal encarcelado y manipulador para ayudar a capturar a otro asesino en serie.',
      genre: 'Thriller',
      posterUrl: 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg'
    },
    {
      title: 'Parasite',
      year: 2019,
      director: 'Bong Joon Ho',
      cast: JSON.stringify(['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong']),
      synopsis: 'La codicia y la discriminación de clases amenazan la relación simbiótica recién formada entre la familia adinerada Park y el clan indigente Kim.',
      genre: 'Thriller',
      posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'
    },
    {
      title: 'Gladiator',
      year: 2000,
      director: 'Ridley Scott',
      cast: JSON.stringify(['Russell Crowe', 'Joaquin Phoenix', 'Connie Nielsen']),
      synopsis: 'Un ex general romano busca venganza contra el corrupto emperador que asesinó a su familia y lo envió a la esclavitud.',
      genre: 'Action',
      posterUrl: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg'
    },
    {
      title: 'The Departed',
      year: 2006,
      director: 'Martin Scorsese',
      cast: JSON.stringify(['Leonardo DiCaprio', 'Matt Damon', 'Jack Nicholson']),
      synopsis: 'Un agente encubierto y un topo en la policía intentan identificarse mutuamente mientras se infiltran en una pandilla irlandesa en Boston.',
      genre: 'Crime',
      posterUrl: 'https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg'
    },
    {
      title: 'Whiplash',
      year: 2014,
      director: 'Damien Chazelle',
      cast: JSON.stringify(['Miles Teller', 'J.K. Simmons', 'Melissa Benoist']),
      synopsis: 'Un joven y prometedor baterista se inscribe en un conservatorio de música donde es mentoreado por un instructor que lo empuja más allá de sus límites.',
      genre: 'Drama',
      posterUrl: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg'
    },
    {
      title: 'The Prestige',
      year: 2006,
      director: 'Christopher Nolan',
      cast: JSON.stringify(['Christian Bale', 'Hugh Jackman', 'Scarlett Johansson']),
      synopsis: 'Después de una tragedia, dos magos rivales en la Londres victoriana se enfrentan en una batalla para crear la mejor ilusión.',
      genre: 'Mystery',
      posterUrl: 'https://image.tmdb.org/t/p/w500/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg'
    }
  ];

  // Insertar películas
  for (const movie of movies) {
    const hashCode = generateMovieHash(movie.title, movie.year);
    
    await prisma.movie.upsert({
      where: { hashCode },
      update: {},
      create: {
        ...movie,
        hashCode
      }
    });
    
    console.log(`✅ Película agregada: ${movie.title} (${movie.year})`);
  }

  console.log('✨ Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
