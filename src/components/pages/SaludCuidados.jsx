import React from 'react';
import InfoViajePage from './InfoViajePage';

const SaludCuidados = () => (
  <InfoViajePage
    intro="Queremos enfatizar un punto importante: San Cristóbal de las Casas tiene problemas frecuentes de abasto y calidad del agua, por lo que les recomendamos tomar algunas precauciones básicas durante su estancia."
    blocks={[
      {
        heading: 'Para evitar malestares estomacales, especialmente quienes tengan el estómago sensible, les sugerimos',
        list: [
          'Consumir únicamente agua embotellada',
          'Evitar tomar agua directamente de la llave',
          'Tener cuidado con hielos, aguas frescas o bebidas preparadas con agua no embotellada',
          'Preferir alimentos bien cocidos, sobre todo durante los primeros días',
          'Tener precaución con comida cruda, ensaladas, frutas sin pelar o alimentos de puestos callejeros si no están acostumbradxs',
          'Llevar medicamentos básicos para malestar estomacal, sales de rehidratación o lo que cada quien acostumbre usar en viajes',
        ],
      },
      {
        text: 'Estas recomendaciones no buscan alarmarles, sino ayudar a que todxs puedan disfrutar su estancia y participar en el congreso sin contratiempos.',
      },
      {
        heading: 'En caso de emergencia',
        highlight: 'Si durante la semana alguna persona presenta una situación de salud o necesita orientación médica básica, hay un hospital cercano de costo razonable (Hospital de Caridad, en la calle Francisco I. Madero 61, Barrio de Guadalupe). La colega Marusia Pola (cel. +52 967 120 3708) tiene contacto directo con una doctora excelente y de mucha confianza que estará pendiente durante los días del congreso por si se presenta alguna emergencia o si alguien necesita una primera orientación.',
      },
    ]}
  />
);

export default SaludCuidados;
