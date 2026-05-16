export type VkAttachmentType = 'photo' | 'video' | 'doc' | 'clip';

const VK_ATTACHMENT_PATTERNS: Record<VkAttachmentType, RegExp> = {
  photo: /photo-?\d+_\d+(?:_[A-Za-z0-9]+)?/,
  video: /video-?\d+_\d+(?:_[A-Za-z0-9]+)?/,
  doc: /doc-?\d+_\d+(?:_[A-Za-z0-9]+)?/,
  clip: /clip-?\d+_\d+(?:_[A-Za-z0-9]+)?/,
};

function collectCandidates(value?: string | null): string[] {
  if (!value) return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  const candidates = [trimmed];
  try {
    const decoded = decodeURIComponent(trimmed);
    if (decoded !== trimmed) candidates.push(decoded);
  } catch {
    // Ignore malformed percent-encoding and fall back to the raw string.
  }

  return candidates;
}

export function extractVkAttachmentByTypes(
  value: string | null | undefined,
  allowedTypes: VkAttachmentType[],
): string | null {
  const candidates = collectCandidates(value);

  for (const candidate of candidates) {
    for (const attachmentType of allowedTypes) {
      const match = candidate.match(VK_ATTACHMENT_PATTERNS[attachmentType]);
      if (match) return match[0];
    }
  }

  return null;
}

export function extractVkAttachment(value?: string | null): string | null {
  return extractVkAttachmentByTypes(value, ['photo', 'video', 'doc', 'clip']);
}

export function extractVkPhotoAttachment(value?: string | null): string | null {
  return extractVkAttachmentByTypes(value, ['photo']);
}
