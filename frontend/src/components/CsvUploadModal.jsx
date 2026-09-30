import React, { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle2, FileText, Download, Loader2, Sparkles, Coffee, Store } from 'lucide-react';
import { uploadSalesCsv } from '../services/api';

export default function CsvUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setValidationResult(null);
      setErrorMsg(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);
    setValidationResult(null);

    try {
      const res = await uploadSalesCsv(file);
      setValidationResult(res);
      setUploading(false);
      setTimeout(() => {
        onUploadSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setUploading(false);
      if (err.detail && typeof err.detail === 'object') {
        setErrorMsg(err.detail.message || 'Validation failed');
        setValidationResult(err.detail);
      } else {
        setErrorMsg(err.detail || 'Upload failed');
      }
    }
  };

  const loadPresetSample = async (samplePath, sampleName) => {
    setUploading(true);
    setErrorMsg(null);
    setValidationResult(null);
    try {
      const resp = await fetch(samplePath);
      const blob = await resp.blob();
      const sampleFile = new File([blob], sampleName, { type: 'text/csv' });
      const res = await uploadSalesCsv(sampleFile);
      setValidationResult(res);
      setUploading(false);
      setTimeout(() => {
        onUploadSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setUploading(false);
      setErrorMsg('Failed to load sample CSV preset.');
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = `date,sku,category,units_sold,unit_price,stock_on_hand,name,cost_price,shelf_life_days,reorder_lead_time_days
2026-09-01,SKU-STAPLE-01,Staples & Grains,8,380,45,Royal Basmati Rice 5kg,300,,7
2026-09-01,SKU-DAIRY-01,Dairy & Perishables,22,52,30,Farm Fresh Milk 1L,42,3,1
2026-09-01,SKU-SNACK-03,Snacks & Beverages,7,190,45,Grand Reserve Masala Chai 250g,115,,3
2026-09-02,SKU-STAPLE-01,Staples & Grains,9,380,36,Royal Basmati Rice 5kg,300,,7
2026-09-02,SKU-DAIRY-01,Dairy & Perishables,24,52,26,Farm Fresh Milk 1L,42,3,1
2026-09-02,SKU-SNACK-03,Snacks & Beverages,6,190,39,Grand Reserve Masala Chai 250g,115,,3`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'kirana_sales_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="kirana-card rounded-2xl border border-panel-border w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-panel hover:bg-panel-light text-sage hover:text-[#f0f6f3] border border-panel-border transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber/20 border border-amber/30 flex items-center justify-center text-amber">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-headline font-bold text-[#f0f6f3]">
              Upload Store Sales CSV
            </h3>
            <p className="text-xs text-sage">
              Ingest raw daily sales transactions for multi-agent analysis
            </p>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-sage uppercase tracking-wider mb-2">
            One-Click Ready Sample Datasets:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => loadPresetSample('/samples/sample_kirana_store_sales.csv', 'sample_kirana_store_sales.csv')}
              disabled={uploading}
              className="p-3 rounded-xl bg-panel-light/70 hover:bg-panel-light border border-panel-border hover:border-amber/40 text-left transition-all group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#f0f6f3] group-hover:text-amber mb-0.5">
                <Store className="w-3.5 h-3.5 text-amber" />
                <span>Kirana Store CSV</span>
              </div>
              <div className="text-[10px] text-sage">Staples, Dairy & Snacks</div>
            </button>

            <button
              onClick={() => loadPresetSample('/samples/sample_cafe_bakery_sales.csv', 'sample_cafe_bakery_sales.csv')}
              disabled={uploading}
              className="p-3 rounded-xl bg-panel-light/70 hover:bg-panel-light border border-panel-border hover:border-amber/40 text-left transition-all group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#f0f6f3] group-hover:text-amber mb-0.5">
                <Coffee className="w-3.5 h-3.5 text-amber" />
                <span>Cafe & Bakery CSV</span>
              </div>
              <div className="text-[10px] text-sage">Espresso, Pastries & Oats</div>
            </button>
          </div>
        </div>

        {/* Upload Custom Dropzone */}
        <div className="border-2 border-dashed border-panel-border hover:border-amber/60 rounded-2xl p-5 text-center transition-colors bg-[#14231e] mb-4">
          <FileText className="w-7 h-7 text-sage mx-auto mb-1.5" />
          <p className="text-xs text-[#f0f6f3] font-medium mb-0.5">
            {file ? file.name : 'Or select your own sales CSV'}
          </p>
          <p className="text-[10px] text-sage/70 mb-2.5 font-mono">
            Columns: date, sku, category, units_sold, unit_price, stock_on_hand
          </p>
          <label className="inline-block px-3.5 py-1.5 rounded-xl bg-panel hover:bg-panel-light text-xs font-semibold text-amber border border-panel-border cursor-pointer transition-colors">
            Browse File
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {/* Validation Errors / Notices */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">{errorMsg}</div>
              {validationResult?.errors && (
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-red-300/90">
                  {validationResult.errors.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {validationResult && validationResult.status === 'success' && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 mb-4 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Validation Passed!</div>
              <div className="text-[11px] text-emerald-300/90">
                Processed {validationResult.rows_processed} rows across {validationResult.skus_identified} SKUs.
              </div>
            </div>
          </div>
        )}

        {/* Action Bottom */}
        <div className="flex items-center justify-between pt-2 border-t border-panel-border/60">
          <button
            onClick={downloadSampleCsv}
            type="button"
            className="inline-flex items-center gap-1 text-xs text-sage hover:text-amber transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber hover:bg-amber-light text-[#12211c] font-bold text-xs transition-all shadow-glow-amber disabled:opacity-40"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Upload & Run</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
