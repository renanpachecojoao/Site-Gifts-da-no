/**
 * Endereços das imagens usadas nas seções da home (hero, ateliê, produtos, avatares).
 * Para trocar uma foto do site, troque a URL aqui.
 */
const G = "https://static.prod-images.emergentagent.com/jobs/4549265b-f990-4a2f-a690-f52f74538705/images/";
const U = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMAGES = {
  hero: G + "1828503381f0c4368d0deb645941ea409a1aa039faf4a15a7c5550e4e7f19c21.jpeg",
  atelier: G + "6cfb6b58e99972719acd36f0379fc4e4a004aeede76e53f751815acb90b1314b.jpeg",
  ima: G + "fda99801ed59b8595961703c7bfca0c3e9460fbec0734dd92c1e778cc367fde2.jpeg",
  imaKit: G + "183e4ad04164526af4659b70a314ca2a9a3215613fa154629834840a1501f49e.jpeg",
  abridor: G + "2bd011b92b1a8c257fc76b1df76d33c773fab8e7b3e07f532400b91f62d6ba70.jpeg",
  chaveiro: G + "3e1e3b9675987d8db4972fe813ec4039e3ca0a2b9e95b6c0cdf7e5c43d41efd5.jpeg",
  espelho: G + "0abc45b906c903e19543a73914afb65a71f574b29708e15d40a2f1e38f88b016.jpeg",
  mini: G + "edd17d96239163ef449cbf842f9d45544716b452f04ecb418a97950a7f3ff939.jpeg",
  brinde: G + "4095c39c4a684d9739560bab5365808ea7d41e5c34355a5102ad0175a934e85b.jpeg",
  quinze: G + "c45f4c52ba991cf8d4a0ae852a0966a7ff6ed75d08a103d1663d2f7aaf403411.jpeg",
  casamento: G + "eb437cbb2fbf61e1bc8921b2dcec583642320434d24033461857a0ee0e76bc44.jpeg",
  empresa: G + "5c0fd0693eff93688a9195577a9b556cbb5a15ad4365b57ca19467a95aea544f.jpeg",
  avatars: [
    U("1534528741775-53994a69daeb", 160),
    U("1507003211169-0a1dd7228f2d", 160),
    U("1544005313-94ddf0286df2", 160),
  ],
};
