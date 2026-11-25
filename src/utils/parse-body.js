const parseBody = async (req, res) => {
    if (res.locals.body && typeof res.locals.body === 'object') return res.locals.body;

    const chunks = [];
    for await (const chunk of req) {
        chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString('utf8').trim();
    if (!raw) {
        res.locals.body = {};
        return res.locals.body;
    }

    try {
        res.locals.body = JSON.parse(raw);
    } catch {
        res.locals.body = {};
    }
    return res.locals.body;
};

export default parseBody;
