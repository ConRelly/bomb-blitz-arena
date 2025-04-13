// Audio Manager for game sounds

// Map to store loaded audio files
const audioCache = new Map<string, HTMLAudioElement>();

// Preload audio files for better performance
export const preloadAudio = (audioFiles: Record<string, string>) => {
  Object.entries(audioFiles).forEach(([key, url]) => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audioCache.set(key, audio);
  });
};

// Play sound with optional volume control
export const playSound = (
  key: string,
  options: { volume?: number; loop?: boolean } = {}
) => {
  try {
    // Check if audio exists in cache
    const cachedAudio = audioCache.get(key);

    if (cachedAudio) {
      // Clone the audio for overlapping sounds
      const audio = cachedAudio.cloneNode(true) as HTMLAudioElement;
      
      // Apply options
      if (options.volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, options.volume));
      }
      
      if (options.loop !== undefined) {
        audio.loop = options.loop;
      }
      
      // Play the sound
      audio.play().catch(error => {
        console.error(`Error playing sound ${key}:`, error);
      });
      
      return audio;
    } else {
      console.warn(`Sound not found: ${key}`);
      return null;
    }
  } catch (error) {
    console.error('Error playing sound:', error);
    return null;
  }
};

// Stop a specific sound
export const stopSound = (audio: HTMLAudioElement | null) => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

// Game sound URLs (using base64 for now, would normally use actual audio files)
export const GAME_SOUNDS = {
  BOMB_PLACE: 'data:audio/wav;base64,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', // Placeholder for bomb place sound
  EXPLOSION: 'data:audio/wav;base64,UklGRvwFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YdgFAACAgICAgICAgICAgICAgICAgICAgICAgICFgpHwubL5joGJkoV/go5ubneGvMuPL2aCY3lbxb/T48vu4cZvX3BwY1t1FURna6/R39n//+jhzLxzW1tlVE9JVFpnj7Pb7e/q+P/979/Qwq+chHFhWVJLSFBZa3qRqcbv///79vLu7OPY0MnDtqidjYZ6cGleVVRVXGZzgJejuM/l8vr49O/p3tLHvK+jlop/dGleVlRYXmaKrM/l9fn///749+rTvKSRgHVrYFVQUFVecY6j1PD19//9+fXx5dbMw7mtopqQhHpwaWRiYmRqd4STp7rK2ujx+f/98ejg2dDGvLOsoZuVjoiDfnl2dHN0doGRobG+zdrj6PHv6ubh29TQzMfCvbiyramloJyYlZKPjoyMjZCanaCkqbG5v8XJzs/V2d7h5unp5+Ld187Fw7++urizraamo6Cbm5qanqOoq6+2vMHGyc/U2dze4+bl5eXk3tfQycC5s62po6Gdm5iWlJOSmJugpqyys7i9wcPHzM/T1tnd3+Hj4+Pj4d3Y0MrEvrm1sa2ppaGfnZybmZmbnqKmqq6ytbi8v8PIzM/T1tjc3d/h4eHg3djU0MvGwr67uLWxramloJ2bmZeWlpmcn6OmqqywtLe5vcHEyMzP0tXY293e4OHh4N7b1tLOycbCv7y5trOvq6iloJ6cmpiXl5mcn6Kkp6qtsLK1uLu+wcTHys3Q09XY2tzd3+Df3tzZ1tPQzcvIxcPAvru4tbKvq6imoJ6bmZiXl5mcn6GkpqmrsLG0t7m8v8PGycvP0tTW2drc3d7e3tzb2NXSz8zKx8XCwL68ubazr6yppaShn56cmpmYmZqdoKKlqKqtsbK0t7m8v8HEyMrN0NLV19na3N3d3dzb2dbUz83Ky8fEwsC+u7m2tK+tqqiloqCenJuamJmbnaCipKaoq66xsrW3ur3AwcXHys3P0dPV2Nnb29zc29nX1dLPzsvIxsXCwL67ubazsa6sqaekop+enJuZmZqdnqCjpaepqq6wsbS2uLu+wcPHycvN0NLU1tfZ2tra2djX1dPRz8zKyMbEwcC9u7m3tbKwraqopaOgn52cmpmZmpyeoKOkpqiqra+ys7W4ury/wcPGycvNz9HT1dbY2NnZ2NfV1NLQzszKyMbEwr++vLq4trOxr6yqqKWjoaCenJuamp2en6Gkpaepqq2vsrO1t7m8vsDDxcfKzM7Q0tTV19fY2NfX1dTT0c/NzMnHxcPBv727ubezsa+tqqinkqGgnp2cm5qcnZ+ho6Slp6mqrK6xsrS3ubq9v8HEx8nLzc/R09TW1tfX19bV1NLRz83MysnHxcPCwL68uri2tLKvraupp6Wjo6GenZ2bnZ6foaOkpqepq62vsLK0tre5u77BwsTGyczOz9HT1NXW1tbW1dTT0tDPzcvKyMfFw8LAvry6uLa0srCuq6mop6WkoqGgn56enp+goqOlpqiqrK6vsLK0tba4ury+wMLExcjLzc7Q0tPU1NXV1NTT0tHQz83My8nIxsXDwcC+vLq5t7WzsrCuq6qopmWkoqGgoKChoqOlpqepq6yusLGztLa3ubq8vsDCxMXHysvNz9DS09PT09PTTaEAAAAAAAAAAA==', // Placeholder for explosion sound
  POWERUP: 'data:audio/wav;base64,UklGRlAFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSwFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAIODCQjPzhmXnJlSjsMCOr29v8QIDO1ztLIqoNULwo+Z5qvk10oDhg6YIWWjm1JIgEHLmyv5v337NKkbDYQJVmZx9zNrkYG2dnx+/3/CAwjaMDbr1YGAAA1gdT9/ejDgzAAAFWs8/fTlj0A8OXHmoV5bW9vgqXQ6ODKlFMH9OvXw7OtoK+42fz9476YaE5OYpTI7OXNmFEAAGCt0sCnd2lxirrn8NawbRcEFjRYgqm3qI12ZGiMwujmvX4oCDRmorn//+zJjzsNJ1OMvtrNq3BGKiNHk+bo1J5dHw8aNl2HoqiXgGpicoLH//TDcxEFLGuatLGgiW9dYHu08tvBfywPMl2LqamXeV9WYYjI8MeRRx4yWXyVpJ2Od2lkdaHa27t6LxQsT3eVqqSOc1tXZI7S3byaVigGH1GIqqaLbVpXZY3S1q12HwQcT4azuZ96UkdOdK3dx5VFFzRqk6ufiGVQTlyn4+G7eDgORnerv7SKYUc9T4XEzaRsOChWiLG4kWlROkZ3utKwekMvTXierspvPSQzW5jRwIdHJUN4sMOdaj0oRnq73K5vLxg5cLfYsmUqHS9iq+K7dSoXNnC44bVpKBMkVpnX0qNmOzJZjMO7hmI4KE6BvMibUiYvYKrVtXQwHzZtsdCgWy0aSZHOtXwsEidlttWtZzklUJDIs3EeECx2ydqhSymes2IYGj1yuMJrIxhEj9SlXB8eVqPPpVcMGUme2KlUChlgrNmeQwo3jt2lTgQhcbvKeSUHHEiW27V1MRpFkNqvaRYgr6kYAyp1udpgGSRvzbtpFQQleriQOQ01j9GXIgdJttqZNAxIp9aZLQtLp9t+GQhCn91vHg9fu8xkDQ9gx7NVBzKb14wlA0u14IkoC1a86n4ZC1q62n0ZCFq/1GQQB1jHwWYUG3DOpRcDMJbRjCIHVcfGeR0NP67gfxkEQ7TnnTISPr3YYQ4HRrzpnDsSO8HaYw0EPcDfdRQITbvelCEJTsLgbBIGP8HfZQ0FS8XjeBoNW8O+VC8YcsDEWBsndsOvRRIagcyiKQhIwOBoGApTyNpnFBJgydVjESF70r1ODhBf1OBiDhVl18RkFBZn2NxdDBRi2NtPEzqK3pEaCFbR52gUD1zM5F4SBFvR5l4UCGPa5VgQD3PaymcUEGbZ1FwRD3Hc2FQNDWfX01QNDGzcy1YSEmDRxVUOEGLNuFcQEW3QvU8LDmbWyVMMDGzXxVILDWfWxFEKDGvZyFEKDGrXxFEKDGnYxlMOEHTavk8KDGbZzFQLDGrXxlMOEmrbyVIMEG7ayFMQFG/ZxVAKDGzbyVEKDGvXw08KEWzYxVEMEG3ZyE8MEGzZx08MEG7byFILDmzaxU8KD2zXw08JD2rXxE4JDmjVwU4IDGnXxE8JDGfVwU4JD2fVw08JD2jVwk8JDmjUwU4IDGjVwU0IDGfUwE4IDGjVwE0IDGfTvk0IDGfTvk0IDGfTvkwICmfTvUwHCGbTvUwICWbTvUwICWXTvUwIC2XSvUwIC2XTvUsIC2XSvUsJCmXSvEsJCmXSvEsJCmTSvEwJC2XSvEsJC2TSuwsKC2XSvEsJC2TSvAsJC2TSvAsKC2TSuwsKDGXSuwsKDGXSvAsKDWbTu0sIDWXTu0sKDWXTuwsKDWXTuwsKDWXTu0sKDWXTuwsKDWXTuwsKDWXTuwsICmXTuwsKDWXTuwsKDGTTuwsKDWXTvEsKDWXTvEsKDWXTvEsKDWXTvEsKDWXTvEsKDWXTvEsKDWXTvEsKDWXTvEsKDWXTvEsKDWXTvEsKDWXTvEsKDWXTvEsKDWXTvEsKDWXTvEsKDWXTvEsKDWXTvEs=' // Power-up collect sound
};

// Initialize the audio manager with game sounds
export const initAudio = () => {
  preloadAudio(GAME_SOUNDS);
};
