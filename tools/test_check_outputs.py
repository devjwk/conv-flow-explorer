"""Exercise the checker with a real reference and an injected Pool 1 error."""
import shutil
import struct
import tempfile
import unittest
from pathlib import Path

from check_outputs import inspect

ROOT=Path(__file__).resolve().parents[1]
REFERENCE=ROOT/'reference/image_0_data'

class OutputCheckTest(unittest.TestCase):
    def test_reference_and_first_bad_coordinate(self):
        with tempfile.TemporaryDirectory() as directory:
            candidate=Path(directory)
            for source in REFERENCE.glob('layer_*_output.bin'):
                shutil.copyfile(source,candidate/source.name)
            self.assertTrue(inspect(REFERENCE,candidate,1e-5,1e-5)['pass'])
            target=candidate/'layer_2_output.bin'
            with target.open('r+b') as stream:
                stream.seek(4*(32*28+2*32+3))
                stream.write(struct.pack('<f',12345.0))
            result=inspect(REFERENCE,candidate,1e-5,1e-5)
            self.assertFalse(result['pass'])
            self.assertEqual(result['firstFailure']['layer'],2)
            self.assertEqual(result['firstFailure']['firstMismatch']['coordinate'],
                             {'row':1,'column':2,'channel':3})
            target.write_bytes(b'bad')
            result=inspect(REFERENCE,candidate,1e-5,1e-5)
            self.assertEqual(result['firstFailure']['status'],'invalid_size')
            target.unlink()
            result=inspect(REFERENCE,candidate,1e-5,1e-5)
            self.assertEqual(result['firstFailure']['status'],'missing')

if __name__=='__main__':
    unittest.main()
