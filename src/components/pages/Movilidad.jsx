import React from 'react';
import InfoViajePage from './InfoViajePage';

const Movilidad = () => (
  <InfoViajePage
    intro="Dentro de San Cristóbal, el transporte público más fácil son los taxis, pero las distancias de interés están muy próximas, así que recomendamos caminar si van a desplazarse entre las sedes del congreso o en el área del Centro."
    blocks={[
      {
        text: 'Es importante señalar que algunas calles son empedradas, tienen pendientes o banquetas irregulares, por lo que recomendamos traer calzado cómodo y tener cuidado especial si llueve, porque algunas piedras son muy resbalosas.',
      },
      {
        highlight: 'San Cristóbal no cuenta con servicio de taxis por aplicación. Para traslados nocturnos o fuera del centro, recomendamos pedir apoyo al hospedaje o a las y los colegas locales, para ubicar previamente un sitio de taxis locales confiable.',
      },
    ]}
  />
);

export default Movilidad;
