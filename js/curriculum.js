/* Curriculum de calcul mental — 5ème
   Contenu basé sur le guide "Le Calcul Mental en Classe de 5ème :
   Techniques et Stratégies pour Progresser" fourni par Antoine. */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function fmt(n) {
  // Affiche proprement les décimaux (pas de .0 inutile) et évite les erreurs d'arrondi JS
  const r = Math.round(n * 1000) / 1000;
  return r.toString().replace('.', ',');
}

function wrapNeg(n) {
  return n < 0 ? `(${fmt(n)})` : fmt(n);
}

const LEVELS = [
  {
    id: 1,
    name: "Tables et compléments",
    desc: "Tables de multiplication jusqu'à 12, compléments à 10, 100 et 1000.",
    generate: () => {
      const kind = pick(['table_mult', 'table_div', 'complement']);
      if (kind === 'table_mult') {
        const a = randInt(2, 12), b = randInt(2, 12);
        return {
          text: `${a} × ${b} = ?`,
          answer: a * b,
          hint: `Si tu ne connais pas directement ${a} × ${b}, calcule ${a} × ${b - 1} (une table plus simple), puis ajoute ${a}.`
        };
      }
      if (kind === 'table_div') {
        const a = randInt(2, 12), b = randInt(2, 12);
        const product = a * b;
        return {
          text: `${product} ÷ ${a} = ?`,
          answer: b,
          hint: `Demande-toi : combien de fois ${a} rentre-t-il dans ${product} ? Utilise la table de ${a}.`
        };
      }
      const base = pick([10, 100, 1000]);
      const part = base === 10 ? randInt(1, 9) : base === 100 ? randInt(1, 99) : randInt(1, 999);
      const unit = base === 10 ? 'la dizaine' : base === 100 ? 'la centaine' : 'le millier';
      return {
        text: `${part} + ? = ${base}`,
        answer: base - part,
        hint: `Avance par étapes : combien faut-il ajouter à ${part} pour atteindre ${unit} tout rond juste au-dessus, puis continue jusqu'à ${base} ?`
      };
    }
  },
  {
    id: 2,
    name: "×÷ par 10, 100, 1000",
    desc: "On décale la virgule vers la droite (×) ou la gauche (÷).",
    generate: () => {
      const factor = pick([10, 100, 1000]);
      const rangs = factor === 10 ? 1 : factor === 100 ? 2 : 3;
      const mult = Math.random() < 0.5;
      if (mult) {
        const base = Math.round(randInt(1, 9999) / 10) / 10; // 1 décimale max
        return {
          text: `${fmt(base)} × ${factor} = ?`,
          answer: base * factor,
          hint: `Multiplier par ${factor} : décale la virgule de ${rangs} rang${rangs > 1 ? 's' : ''} vers la droite.`
        };
      }
      const result = Math.round(randInt(1, 9999) / 10) / 10;
      const base = result * factor;
      return {
        text: `${fmt(base)} ÷ ${factor} = ?`,
        answer: result,
        hint: `Diviser par ${factor} : décale la virgule de ${rangs} rang${rangs > 1 ? 's' : ''} vers la gauche.`
      };
    }
  },
  {
    id: 3,
    name: "Addition et soustraction astucieuses",
    desc: "Regrouper les nombres ronds, compenser avec 9, 11, 19, 21…",
    generate: () => {
      const kind = pick(['regroupe', 'compense']);
      if (kind === 'regroupe') {
        // deux nombres qui font une dizaine/centaine ronde + un troisième
        const round = pick([10, 20, 30, 40, 50, 100]);
        const a = randInt(1, round - 1);
        const b = round - a;
        const c = randInt(5, 60);
        const parts = [a, b, c].sort(() => Math.random() - 0.5);
        return {
          text: `${parts[0]} + ${parts[1]} + ${parts[2]} = ?`,
          answer: a + b + c,
          hint: `Cherche parmi ces trois nombres deux qui, additionnés, donnent un nombre rond (dizaine ou centaine). Additionne-les d'abord.`
        };
      }
      const near = pick([9, 11, 19, 21, 29, 31]);
      const a = randInt(30, 90);
      const isAdd = Math.random() < 0.5;
      const round = Math.round(near / 10) * 10;
      const diff = near - round;
      const secondOp = isAdd
        ? (diff > 0 ? 'ajoute' : 'enlève')
        : (diff > 0 ? 'enlève' : 'ajoute');
      return {
        text: `${a} ${isAdd ? '+' : '-'} ${near} = ?`,
        answer: isAdd ? a + near : a - near,
        hint: `${near} est proche de ${round}. Fais d'abord ${a} ${isAdd ? '+' : '-'} ${round}, puis ${secondOp} ${Math.abs(diff)}.`
      };
    }
  },
  {
    id: 4,
    name: "Multiplier par 4, 5, 0,5, 0,1",
    desc: "×4 = doubler deux fois. ×5 = ×10 puis ÷2. ×0,5 = ÷2. ×0,1 = ÷10.",
    generate: () => {
      const kind = pick(['x4', 'x5', 'x05', 'x01']);
      if (kind === 'x4') {
        const a = randInt(6, 60);
        return {
          text: `${a} × 4 = ?`,
          answer: a * 4,
          hint: `Multiplier par 4, c'est doubler deux fois : calcule ${a} × 2, puis double encore ce résultat.`
        };
      }
      if (kind === 'x5') {
        const a = randInt(4, 80);
        return {
          text: `${a} × 5 = ?`,
          answer: a * 5,
          hint: `Multiplier par 5, c'est multiplier par 10 puis diviser par 2 : calcule ${a} × 10 = ${a * 10}, puis divise ce résultat par 2.`
        };
      }
      if (kind === 'x05') {
        const a = randInt(2, 100) * 2; // toujours pair pour un résultat entier
        return {
          text: `${a} × 0,5 = ?`,
          answer: a * 0.5,
          hint: `Multiplier par 0,5, c'est diviser par 2.`
        };
      }
      const a = randInt(2, 90) * 10; // multiple de 10 pour résultat entier
      return {
        text: `${a} × 0,1 = ?`,
        answer: a * 0.1,
        hint: `Multiplier par 0,1, c'est diviser par 10 : décale la virgule d'un rang vers la gauche.`
      };
    }
  },
  {
    id: 5,
    name: "Diviser par 4 et par 5",
    desc: "÷4 = moitié de la moitié. ÷5 = ÷10 puis ×2.",
    generate: () => {
      const by4 = Math.random() < 0.5;
      if (by4) {
        const result = randInt(2, 40);
        return {
          text: `${result * 4} ÷ 4 = ?`,
          answer: result,
          hint: `Diviser par 4, c'est prendre la moitié de la moitié : divise ${result * 4} par 2, puis divise encore le résultat par 2.`
        };
      }
      const result = randInt(2, 60);
      return {
        text: `${result * 5} ÷ 5 = ?`,
        answer: result,
        hint: `Diviser par 5, c'est diviser par 10 puis multiplier par 2 : calcule ${result * 5} ÷ 10, puis multiplie ce résultat par 2.`
      };
    }
  },
  {
    id: 6,
    name: "Multiplication à deux chiffres",
    desc: "Décomposer un facteur : 12 × 15 = 12 × 10 + 12 × 5.",
    generate: () => {
      const a = randInt(11, 19);
      const b = randInt(4, 19);
      return {
        text: `${a} × ${b} = ?`,
        answer: a * b,
        hint: `Décompose ${a} en 10 + ${a - 10}. Calcule ${b} × 10 = ${b * 10}, puis ${b} × ${a - 10}, et additionne les deux résultats.`
      };
    }
  },
  {
    id: 7,
    name: "Nombres relatifs",
    desc: "Même signe : on additionne. Signes contraires : on soustrait.",
    generate: () => {
      const a = randInt(-40, 40) || 3;
      const b = randInt(-40, 40) || 5;
      const isAdd = Math.random() < 0.5;
      const text = isAdd
        ? `${wrapNeg(a)} + ${wrapNeg(b)} = ?`
        : `${wrapNeg(a)} - ${wrapNeg(b)} = ?`;
      let hint;
      if (isAdd) {
        const sameSign = (a >= 0) === (b >= 0);
        if (sameSign) {
          hint = `Les deux nombres ont le même signe : garde ce signe et additionne leurs distances à zéro (|${a}| et |${b}|).`;
        } else {
          const far = Math.abs(a) >= Math.abs(b) ? a : b;
          hint = `Signes contraires : soustrais la plus petite distance à zéro de la plus grande, et garde le signe du nombre le plus loin de zéro (ici celui de ${far}).`;
        }
      } else {
        hint = `Soustraire un nombre relatif, c'est ajouter son opposé : ${wrapNeg(a)} - ${wrapNeg(b)} = ${wrapNeg(a)} + ${wrapNeg(-b)}.`;
      }
      return { text, answer: isAdd ? a + b : a - b, hint };
    }
  },
  {
    id: 8,
    name: "Pourcentages",
    desc: "50 % = ÷2. 25 % = ÷4. 10 % = ÷10. 20 % = ÷10 puis ×2.",
    generate: () => {
      const p = pick([50, 25, 10, 20]);
      let base;
      if (p === 50) base = randInt(2, 200) * 2;
      else if (p === 25) base = randInt(2, 100) * 4;
      else base = randInt(2, 50) * 10; // pour 10% et 20%
      const hints = {
        50: `50 %, c'est la moitié : divise ${base} par 2.`,
        25: `25 %, c'est le quart : divise ${base} par 4 (ou divise par 2, deux fois).`,
        10: `10 %, c'est diviser ${base} par 10.`,
        20: `20 %, c'est diviser ${base} par 10, puis multiplier le résultat par 2.`
      };
      return { text: `${p} % de ${base} = ?`, answer: (base * p) / 100, hint: hints[p] };
    }
  },
  {
    id: 9,
    name: "Fractions",
    desc: "Simplifier une fraction, ou prendre une fraction d'une quantité.",
    generate: () => {
      const kind = pick(['simplify', 'part']);
      if (kind === 'simplify') {
        let num, den, g;
        do {
          den = randInt(4, 15);
          num = randInt(1, den - 1);
          g = gcd(num, den);
        } while (g === 1);
        return {
          text: `Simplifie ${num}/${den} (réponds sous la forme a/b)`,
          answer: `${num / g}/${den / g}`,
          answerType: 'fraction',
          hint: `Cherche un nombre qui divise à la fois ${num} et ${den} (essaie 2, 3 ou 5), puis divise le numérateur et le dénominateur par ce nombre.`
        };
      }
      const fracs = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5]];
      const [n, d] = pick(fracs);
      const base = randInt(2, 20) * d;
      return {
        text: `${n}/${d} de ${base} = ?`,
        answer: (base / d) * n,
        hint: `Divise d'abord ${base} par ${d} (le dénominateur), puis multiplie le résultat par ${n} (le numérateur).`
      };
    }
  },
  {
    id: 10,
    name: "Révision générale",
    desc: "Un mélange de toutes les techniques apprises.",
    generate: () => {
      const level = pick(LEVELS.slice(0, 9));
      return level.generate();
    }
  }
];

const MAX_LEVEL = LEVELS.length;

function getLevel(id) {
  return LEVELS.find(l => l.id === id) || LEVELS[0];
}
