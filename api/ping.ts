module.exports = (req: any, res: any) => {
  res.setHeader('content-type', 'application/json');
  res.status(200).send(JSON.stringify({ ok: true, now: new Date().toISOString(), runtime: 'node-cjs' }));
};


