import React from 'react';

const CallForParticipation = ({ lang }) => {
  const content = {
    es: {
      intro: `En el XVII Congreso de la rama latinoamericana de la IASPM reflexionaremos sobre las músicas populares desde las preguntas éticas y políticas que atraviesan nuestra vida en común, en estos tiempos en los que nociones que dábamos por sentadas adquieren significados hace poco impensables, cuando resulta difícil establecer siquiera mínimos compartidos para la convivencia en diversos niveles y contextos, cuando los horizontes de sentido parecen reducirse a los horizontes de negocio y conceptos como dignidad y justicia son tachados de "radicales", y cuando la violencia, la precariedad y los despojos no dejan de profundizarse en toda América Latina. En este marco, también emergen y persisten iniciativas que apuestan por otras formas de estar en el mundo y es nuestro deber reconocerlas.`,
      intro2: `El campo musical no puede pensarse como autónomo de los conflictos y tensiones sociales, como nos recuerdan polémicas recientes como la generada por "+57" en Colombia o los corridos tumbados en México. En este encuentro debatiremos sobre las intersecciones entre ética, política y música popular, así como sobre los temas que se tratarán en los 19 simposios que vertebran el Congreso.`,
      intro3: `Con el apoyo de instituciones educativas, culturales y de gobierno el XVII Congreso se desarrollará en el Centro Histórico de la ciudad colonial de San Cristóbal de Las Casas, Chiapas (México), del 29 de septiembre al 2 de octubre del 2026.`
    },
    pt: {
      intro: `No XVII Congresso da filial latino-americana da IASPM refletiremos sobre as músicas populares a partir das perguntas éticas e políticas que atravessam nossa vida em comum, nestes tempos em que noções que tomávamos como certas adquirem significados até há pouco impensáveis, quando resulta difícil estabelecer sequer mínimos compartilhados para a convivência em diversos níveis e contextos, quando os horizontes de sentido parecem reduzir-se aos horizontes de negócio e conceitos como dignidade e justiça são tachados de "radicais", e quando a violência, a precariedade e os despojos não param de se aprofundar em toda a América Latina. Neste marco, também emergem e persistem iniciativas que apostam por outras formas de estar no mundo e é nosso dever reconhecê-las.`,
      intro2: `O campo musical não pode ser pensado como autônomo dos conflitos e tensões sociais, como nos recordam polêmicas recentes como a gerada por "+57" na Colômbia ou os corridos tumbados no México. Neste encontro debateremos sobre as intersecções entre ética, política e música popular, assim como sobre os temas que serão tratados nos 19 simpósios que vertebram o Congresso.`,
      intro3: `Com o apoio de instituições educativas, culturais e de governo, o XVII Congresso se desenvolverá no Centro Histórico da cidade colonial de San Cristóbal de Las Casas, Chiapas (México), de 29 de setembro a 2 de outubro de 2026.`
    }
  };

  const t = content[lang] || content.es;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
      <div className="max-w-4xl mx-auto space-y-6">
        <p className="text-gray-700 text-justify leading-relaxed">
          {t.intro}
        </p>
        <p className="text-gray-700 text-justify leading-relaxed">
          {t.intro2}
        </p>
        <p className="text-gray-700 text-justify leading-relaxed">
          {t.intro3}
        </p>
      </div>
    </div>
  );
};

export default CallForParticipation;
