const Lead = require('../models/Lead');
const { AppError, asyncHandler } = require('../middleware/error');

// POST /api/leads — public (used by the website chat widget)
exports.createLead = asyncHandler(async (req, res) => {
  const { name, phone, email, interest, note } = req.body;

  if (!name || String(name).trim().length < 2) throw new AppError('A valid name is required', 400);
  if (!/^[0-9]{10}$/.test(String(phone || '').replace(/\D/g, ''))) throw new AppError('Phone must be a 10-digit number', 400);
  if (!/^\S+@\S+\.\S+$/.test(String(email || ''))) throw new AppError('A valid email is required', 400);

  const lead = await Lead.create({
    name: String(name).trim().slice(0, 80),
    phone: String(phone).replace(/\D/g, '').slice(-10),
    email: String(email).toLowerCase().trim(),
    interest: String(interest || '').slice(0, 120),
    note: String(note || '').slice(0, 1000),
    source: 'website_chat',
  });

  res.status(201).json({ success: true, message: 'Thank you! Your details have been received.', data: { id: lead._id } });
});

// GET /api/leads — admin list
exports.getLeads = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const filter = { deletedAt: null };
  if (status && ['new', 'contacted', 'converted', 'closed'].includes(status)) filter.status = status;

  const [leads, total] = await Promise.all([
    Lead.find(filter).sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)).select('-__v'),
    Lead.countDocuments(filter),
  ]);

  res.json({ success: true, data: leads, pagination: { currentPage: Number(page), totalPages: Math.ceil(total / Number(limit)) || 1, totalItems: total } });
});

// PATCH /api/leads/:id — admin update status
exports.updateLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['new', 'contacted', 'converted', 'closed'].includes(status)) throw new AppError('Invalid status', 400);

  const lead = await Lead.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { status }, { new: true, runValidators: true }).select('-__v');
  if (!lead) throw new AppError('Lead not found', 404);

  res.json({ success: true, message: 'Lead updated', data: lead });
});

// DELETE /api/leads/:id — admin soft delete
exports.deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { deletedAt: new Date() }, { new: true });
  if (!lead) throw new AppError('Lead not found', 404);

  res.json({ success: true, message: 'Lead removed' });
});