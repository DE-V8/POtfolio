'use strict';

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    // 1. Grant public permissions for our APIs
    try {
      const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
        populate: ['permissions'],
      });

      if (publicRole) {
        const apis = ['app', 'work', 'about', 'track', 'wallpaper', 'link'];
        const actions = ['find', 'findOne'];

        for (const api of apis) {
          for (const action of actions) {
            const actionString = `api::${api}.${api}.${action}`;
            
            // Check if permission already exists
            const existing = publicRole.permissions.find(p => p.action === actionString);
            if (!existing) {
              await strapi.query('plugin::users-permissions.permission').create({
                data: {
                  action: actionString,
                  role: publicRole.id,
                },
              });
              console.log(`Granted public permission for ${actionString}`);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error bootstrapping public permissions:', err);
    }

    // 2. Seed default data if database is empty
    try {
      // Seed Apps
      const existingAppsCount = await strapi.query('api::app.app').count();
      if (existingAppsCount === 0) {
        console.log('Seeding default apps...');
        const appsData = [
          { name: 'Photoshop Works', slug: 'photoshop', icon: '🎨', color: '#FF6B9D', order: 1 },
          { name: 'Video Editing',   slug: 'video',      icon: '🎬', color: '#FF9F43', order: 2 },
          { name: '3D Art',          slug: '3d',         icon: '🧊', color: '#54A0FF', order: 3 },
          { name: 'UI/UX Design',    slug: 'uiux',       icon: '🖌️', color: '#5F27CD', order: 4 },
          { name: 'Dev Projects',    slug: 'dev',        icon: '💻', color: '#1DD1A1', order: 5 },
          { name: 'Illustrations',   slug: 'illustrations', icon: '✏️', color: '#FECA57', order: 6 },
        ];

        const createdApps = {};
        for (const app of appsData) {
          const res = await strapi.documents('api::app.app').create({
            data: { ...app, locale: 'en' },
            status: 'published'
          });
          createdApps[app.slug] = res.documentId || res.id;
        }

        console.log('Seeding default works...');
        const worksData = [
          {
            title: 'Snorlax in Times Square',
            description: 'A matte painting composite showing a giant Snorlax sleeping in the middle of Times Square, New York.',
            tags: 'Photoshop, Matte Painting, Compositing',
            link: 'https://unsplash.com/',
            date: '2026-06-09',
            featured: true,
            app: createdApps['photoshop']
          },
          {
            title: 'Cyberpunk City Neon FX',
            description: 'Photoshop digital art blending cyberpunk assets with high-contrast color grading.',
            tags: 'Photoshop, Cyberpunk, Digital Art',
            link: 'https://unsplash.com/',
            date: '2026-06-08',
            featured: false,
            app: createdApps['photoshop']
          },
          {
            title: 'Creative Motion Reel 2026',
            description: 'A dynamic video editing compilation showing rapid cuts, sound design sync, and color correction.',
            tags: 'Premiere, After Effects, Sound Design',
            link: 'https://youtube.com/',
            date: '2026-06-07',
            featured: true,
            app: createdApps['video']
          },
          {
            title: 'Low Poly Pokémon Village',
            description: '3D modeling of a peaceful village styled after Pallet Town, modeled and rendered in Blender.',
            tags: 'Blender, 3D Modeling, Rendering',
            link: 'https://blender.org/',
            date: '2026-06-06',
            featured: true,
            app: createdApps['3d']
          },
          {
            title: 'Mech Snorlax Model',
            description: 'Hard surface modeling project creating a robotic mech suit version of Snorlax.',
            tags: 'Blender, Hard Surface, Texturing',
            link: 'https://blender.org/',
            date: '2026-06-05',
            featured: false,
            app: createdApps['3d']
          },
          {
            title: 'Pokedex Mobile UX concept',
            description: 'Figma prototype of a modern mobile Pokédex app with intuitive filters and animations.',
            tags: 'Figma, UI/UX, Mobile Design',
            link: 'https://figma.com/',
            date: '2026-06-04',
            featured: true,
            app: createdApps['uiux']
          },
          {
            title: 'Portfolio OS (Snorlax XP)',
            description: 'This interactive Windows XP website, featuring custom window managers, state machines, sound design, and custom widgets.',
            tags: 'React, Zustand, Framer Motion, CSS Modules',
            link: 'https://github.com/debuuu/personal-website',
            date: '2026-06-03',
            featured: true,
            app: createdApps['dev']
          },
          {
            title: 'Retro Snorlax Vector Illustration',
            description: 'A cozy illustration of Snorlax eating pancakes, created with clean vector shapes.',
            tags: 'Illustrator, Vector, Flat Design',
            link: 'https://adobe.com/illustrator',
            date: '2026-06-02',
            featured: false,
            app: createdApps['illustrations']
          }
        ];

        for (const work of worksData) {
          await strapi.documents('api::work.work').create({
            data: { ...work, locale: 'en' },
            status: 'published'
          });
        }
      }

      // Seed About Me
      const existingAboutCount = await strapi.query('api::about.about').count();
      if (existingAboutCount === 0) {
        console.log('Seeding default about info...');
        await strapi.documents('api::about.about').create({
          data: {
            name: 'Debjit Debnath',
            tagline: 'Creative Developer · Digital Artist · Video Editor · 3D Artist',
            bio: 'Hey! I\'m Debuuu — a creative developer who lives at the intersection of code and art. I make things that look good and work even better.',
            instagram: 'https://instagram.com/ifdebuu',
            twitter: '',
            github: 'https://github.com/DE-V8',
            linkedin: '',
            locale: 'en'
          },
          status: 'published'
        });
      }

      // Seed Tracks
      const existingTracksCount = await strapi.query('api::track.track').count();
      if (existingTracksCount === 0) {
        console.log('Seeding default tracks...');
        const tracksData = [
          { title: 'Lavender Town', artist: 'Pokémon OST', duration: '3:12' },
          { title: 'Pallet Town Theme', artist: 'Pokémon OST', duration: '2:45' }
        ];
        for (const track of tracksData) {
          await strapi.documents('api::track.track').create({
            data: { ...track, locale: 'en' },
            status: 'published'
          });
        }
      }

      // Seed Links (browser shortcuts)
      const existingLinksCount = await strapi.query('api::link.link').count();
      if (existingLinksCount === 0) {
        console.log('Seeding default links...');
        const linksData = [
          { name: 'Instagram', url: 'https://www.instagram.com/ifdebuu/', icon: '📸', order: 1 },
          { name: 'GitHub',    url: 'https://github.com/DE-V8',           icon: '🐙', order: 2 },
        ];
        for (const link of linksData) {
          await strapi.documents('api::link.link').create({
            data: link,
            status: 'published'
          });
        }
      }
    } catch (err) {
      console.error('Error seeding default data:', err);
    }
  }
};
