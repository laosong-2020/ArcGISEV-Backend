// src/services/edgeBuilder.js

function buildEdges(nodes) {
  const idMap = Object.fromEntries(nodes.map(node => [node.id, true]));

  const edges = [];

  if (idMap['client'] && idMap['portalAdaptor']) {
    edges.push({ source: 'client', target: 'portalAdaptor' });
  }
  if (idMap['client'] && idMap['serverAdaptor']) {
    edges.push({ source: 'client', target: 'serverAdaptor' });
  }
  if (idMap['portalAdaptor'] && idMap['portal']) {
    edges.push({ source: 'portalAdaptor', target: 'portal' });
  }
  if (idMap['serverAdaptor'] && idMap['server']) {
    edges.push({ source: 'serverAdaptor', target: 'server' });
  }
  if (idMap['portal'] && idMap['server']) {
    edges.push({ source: 'portal', target: 'server' });
  }
  if (idMap['server'] && idMap['dataStore']) {
    edges.push({ source: 'server', target: 'dataStore' });
  }
  return edges;
}

export { buildEdges };