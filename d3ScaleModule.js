/**
 * Created by Rick on 2019-01-15.
 */

import * as d3time from 'd3-time';
import * as d3scale from 'd3-scale';
import {schemeCategory10} from 'd3-scale-chromatic';
import {min,max} from 'd3-array';

const time_interval = {
  year: d3time.timeYear,
  month: d3time.timeMonth,
  week: d3time.timeWeek,
  day: d3time.timeDay,
  hour: d3time.timeHour,
  minute: d3time.timeMinute,
  second: d3time.timeSecond,
  millisecond: d3time.timeMillisecond
};

function linear_scale(minmax,pixels,xy,do_nice){
  const scaleLinear = d3scale.scaleLinear();
  //define scaling range
  if(xy === 'x'){
    scaleLinear.range([0,pixels]);
  }else if(xy === 'y') {
    scaleLinear.range([pixels, 0]);
  }
  //define scaling domain
  if(do_nice){
    scaleLinear.domain(minmax).nice();
  }else {
    scaleLinear.domain(minmax);
  }
  return scaleLinear;
}

function band_scale(bands,pixels,xy,padding){
  const scaleBand = d3scale.scaleBand();
  //define scaling range
  if(xy === 'x'){
    scaleBand.range([0,pixels]);
  }else if(xy === 'y'){
    scaleBand.range([pixels,0]);
  }
  if(Object.keys(padding)[0] === 'padding'){
    scaleBand.padding(padding['padding']);
  }else if(Object.keys(padding)[0] === 'paddingInner'){
    scaleBand.paddingInner(padding['paddingInner']);
  }else if(Object.keys(padding)[0] === 'paddingOuter'){
    scaleBand.paddingOuter(padding['paddingOuter']);
  }
  //define band scale domain
  scaleBand.domain(bands);
  return scaleBand;
}

function time_scale(minmax,pixels,xy,do_nice){
  const scaleTime = d3scale.scaleTime();
  //define scaling range
  if(xy === 'x'){
    scaleTime.range([0,pixels]);
  }else if(xy === 'y'){
    scaleTime.range([pixels,0]);
  }
  //define time scale domain
  if(do_nice){
    scaleTime.domain(minmax).nice();
  }else{
    scaleTime.domain(minmax);
  }
  return scaleTime;
}

function color_scale(color_ar=d3scalechrom.schemeCategory10,keys=null){
  //define color scaling
  const color_scale = d3scale.scaleOrdinal(color_ar);
  //define color scaling domain other than integers
  if(keys !== null){
    color_scale.domain(keys);
  }
  return color_scale;
}

function define_scale(data_type,xy,minmax,pixels,do_nice=false,padding=null){
  let scale = null;
  switch(data_type){
    case 'linear':
      scale = linear_scale(minmax,pixels,xy,do_nice);
      break;
    case 'time':
      scale = time_scale(minmax,pixels,xy,do_nice);
      break;
    case 'band':
      scale = band_scale(minmax,pixels,xy,padding);
      break;
  }
  return scale;
}

function minmax(data,keys){
  const minmax = [];
  //note: d3.min/d3.max works for both numeric and Date data
  minmax.push(min(data,d => {
    return min(keys, key => {
      return d[key];
    });
  }));
  minmax.push(max(data,d => {
    return max(keys, key => {
      return d[key];
    });
  }));
  return minmax;
}

function nice_number(range,roundIt){
  const exponent = Math.floor(Math.log10(range));
  const fraction = range/Math.pow(10,exponent);
  let nice_fraction = null;
  if(roundIt){
    if(fraction < 1.5)
      nice_fraction = 1;
    else if(fraction < 3)
      nice_fraction = 2;
    else if(fraction < 7)
      nice_fraction = 5;
    else
      nice_fraction = 10;
  }else {
    if(fraction <= 1)
      nice_fraction = 1;
    else if(fraction <= 2)
      nice_fraction = 2;
    else if(fraction <= 5)
      nice_fraction = 5;
    else
      nice_fraction = 10;
  }
  return nice_fraction * Math.pow(10,exponent);
}

function calculate_scale(amin,amax,ticks=9,do_nice=true){
  if(do_nice){
    const range = nice_number(amax-amin,false);
    const tick_spacing = nice_number(range/(ticks-1),true);
    const nice_min = Math.floor(amin/tick_spacing) * tick_spacing;
    const nice_max = Math.ceil(amax/tick_spacing) * tick_spacing;
    return {min: nice_min, max: nice_max, step: tick_spacing};
  }else {
    const range = amax - amin;
    const tick_spacing = range/(ticks-1);
    const force_min = Math.floor(amin/tick_spacing) * tick_spacing;
    const force_max = Math.ceil(amax/tick_spacing) * tick_spacing;
    return {min: force_min, max: force_max, step: tick_spacing};
  }
}

function calculate_tick_values(do_ordinal,min,max){
  if(do_ordinal){
    return d3array.range(min,max);
  }else {
    const nice_scale = calculate_scale(min,max);
    return d3array.range(nice_scale.min,nice_scale.max + nice_scale.step,nice_scale.step);
  }
}
export {time_interval,linear_scale,band_scale,time_scale,color_scale,define_scale,minmax,nice_number,calculate_scale,calculate_tick_values};